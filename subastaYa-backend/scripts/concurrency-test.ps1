# Prueba de concurrencia optimista:
# dos pujas identicas disparadas en paralelo -> una 201, la otra 409 Conflict.
param(
    [string]$BaseUrl = "http://localhost:5267/api/v1",
    [int]$AuctionId = 2,
    [int]$MaxAttempts = 5
)

$ErrorActionPreference = "Stop"

# En Windows PowerShell (.NET Framework) el primer POST paga costos sincronicos que
# serializan la carrera: el handshake "Expect: 100-continue" y el limite de conexiones.
[System.Net.ServicePointManager]::Expect100Continue = $false
[System.Net.ServicePointManager]::DefaultConnectionLimit = 10

function Get-Token($email) {
    $body = @{ email = $email; password = "Test1234!" } | ConvertTo-Json
    (Invoke-RestMethod -Uri "$BaseUrl/sessions" -Method Post -ContentType "application/json" -Body $body).token
}

Write-Host "Autenticando a comprador1 y comprador2..."
$token1 = Get-Token "comprador1@test.com"
$token2 = Get-Token "comprador2@test.com"

Add-Type -AssemblyName System.Net.Http
$client = New-Object System.Net.Http.HttpClient

function New-BidRequest($token, $amount) {
    $request = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, "$BaseUrl/auctions/$AuctionId/bids")
    $request.Headers.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $token)
    $json = @{ amount = $amount } | ConvertTo-Json
    $request.Content = New-Object System.Net.Http.StringContent($json, [System.Text.Encoding]::UTF8, "application/json")
    return $request
}

for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {

    # Warm-up: dos GET paralelos dejan dos conexiones abiertas, asi los POST
    # de la carrera salen por sockets ya establecidos, realmente juntos.
    $w1 = $client.GetAsync("$BaseUrl/auctions/$AuctionId")
    $w2 = $client.GetAsync("$BaseUrl/auctions/$AuctionId")
    [System.Threading.Tasks.Task]::WaitAll(@($w1, $w2))

    $detail = Invoke-RestMethod -Uri "$BaseUrl/auctions/$AuctionId"
    $amount = $detail.minNextBid
    Write-Host "Intento $attempt : ambas pujas de $amount sobre '$($detail.title)'"

    $task1 = $client.SendAsync((New-BidRequest $token1 $amount))
    $task2 = $client.SendAsync((New-BidRequest $token2 $amount))
    [System.Threading.Tasks.Task]::WaitAll(@($task1, $task2))

    $codes = @([int]$task1.Result.StatusCode, [int]$task2.Result.StatusCode) | Sort-Object
    Write-Host "  Codigos de respuesta: $($codes -join ', ')"

    if (($codes -contains 201) -and ($codes -contains 409)) {
        Write-Host "OK: una puja se registro (201) y la otra fue rechazada por concurrencia optimista (409)." -ForegroundColor Green
        exit 0
    }

    Write-Host "  Se serializaron (la segunda ya vio el precio nuevo). Reintentando..." -ForegroundColor Yellow
}

Write-Host "No se logro la colision en $MaxAttempts intentos: revisar que la subasta siga activa." -ForegroundColor Yellow
exit 1
