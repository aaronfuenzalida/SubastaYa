# SubastaYa

Plataforma web de subastas en tiempo real con billetera virtual en garantía (escrow), regla anti-sniping y adjudicación automática. Trabajo Práctico — Proyecto de Software (UNAJ).

## Arquitectura

Monorepo con dos aplicaciones:

```
subastaYa-backend/    API REST — .NET 10, Clean Architecture
subastaYa-frontend/   SPA — React 19 + Vite + Tailwind CSS 4
```

**Backend** — cuatro capas con dependencias hacia adentro:

| Capa | Responsabilidad |
|---|---|
| `SubastaYa.Domain` | Entidades, enums y excepciones de negocio. Sin dependencias. |
| `SubastaYa.Application` | Servicios/casos de uso, DTOs e interfaces (repositorios, UnitOfWork). |
| `SubastaYa.Infrastructure` | EF Core + PostgreSQL (code-first con migraciones), repositorios, worker de adjudicación, JWT/BCrypt. |
| `SubastaYa.API` | Controllers REST, middleware de errores, Swagger. |

Puntos clave del diseño:

- **Escrow atómico**: cada puja libera la retención del líder anterior y congela la del nuevo en una única transacción (un solo `SaveChanges` vía UnitOfWork), con registro contable inmutable (`LedgerEntries`).
- **Concurrencia optimista**: campo `Version` en `Auctions` — toda puja lo incrementa; dos pujas simultáneas ⇒ una se registra y la otra recibe `409 Conflict`. Las billeteras usan `xmin` de PostgreSQL.
- **Anti-sniping**: puja a ≤60s del cierre ⇒ la subasta se extiende 2 minutos (auditado).
- **Worker** (`BackgroundService`, cada 30s): activa subastas programadas y finaliza las vencidas — con ganador liquida (debita comprador, acredita vendedor), sin pujas las marca desiertas.
- **Auditoría** (`AuditLogs`): cambios de estado, extensiones anti-sniping, depósitos y pujas rechazadas por concurrencia.
- **Tiempo real con SignalR** (WebSockets): hub en `/hubs/auctions` con un grupo por subasta; cada puja confirmada y cada cambio de estado del worker se emiten al grupo — los espectadores reciben el evento al instante, sin polling.

**Frontend**: catálogo con filtros/orden/paginación, sala de subasta en vivo (WebSockets vía SignalR, con reconexión automática), publicación con vista previa, billetera con historial, panel de actividades y modo oscuro.

## Backend — configuración y ejecución

Requisitos: [.NET SDK 10](https://dotnet.microsoft.com/download) y una base PostgreSQL ([Supabase](https://supabase.com) gratuito funciona directo; usar el connection string del *Session pooler*).

```powershell
cd subastaYa-backend/src/SubastaYa.API

dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=<pooler-host>;Port=5432;Database=postgres;Username=postgres.<project-ref>;Password=<password>;SSL Mode=Require"
dotnet user-secrets set "Jwt:Secret" "<string-aleatorio-de-32-o-mas-caracteres>"

cd ..\..
dotnet run --project src/SubastaYa.API
```

Al arrancar, la API **aplica las migraciones y siembra los datos de prueba automáticamente** (solo si la base está vacía). Swagger UI: `http://localhost:5267/swagger`.

**Usuarios de prueba** (contraseña de todos: `Test1234!`):

| Email | Rol |
|---|---|
| `vendedor@test.com` | Publica las subastas del seed |
| `comprador1@test.com` | Postor líder ($150.000, $45.000 retenidos) |
| `comprador2@test.com` | Postor habilitado ($200.000) |
| `sinfondos@test.com` | Solo $500 — para probar el rechazo 422 |

**Reset de la demo** (fechas frescas del seed): ejecutar en el SQL Editor y reiniciar la API —

```sql
TRUNCATE TABLE "Users", "Wallets", "Categories", "Auctions", "Bids", "LedgerEntries", "AuditLogs"
RESTART IDENTITY CASCADE;
```

## Frontend — configuración y ejecución

Requisitos: Node.js 20+.

```powershell
cd subastaYa-frontend
npm install
npm run dev
```

App en `http://localhost:5173`. La URL de la API se configura en `.env` (`VITE_API_URL`, ya apunta a `http://localhost:5267/api/v1` — no contiene secretos, por eso sí está versionado).

## Prueba de concurrencia optimista (Stress Test)

El script [`subastaYa-backend/scripts/concurrency-test.ps1`](subastaYa-backend/scripts/concurrency-test.ps1) dispara **dos pujas idénticas en paralelo** (dos usuarios, mismo monto, mismo instante) contra una subasta:

```powershell
# con la API corriendo y el seed fresco:
.\subastaYa-backend\scripts\concurrency-test.ps1 -AuctionId 2
```

Resultado esperado: `201, 409` — ambas peticiones leen `Version = N`, ambas intentan `UPDATE ... WHERE Version = N`; la base solo se lo concede a una (la otra afecta 0 filas ⇒ `DbUpdateConcurrencyException` ⇒ `409 Conflict`), y su transacción completa (puja + retenciones + asientos) se revierte. El rechazo queda auditado en `AuditLogs`. Si una ronda se serializa (la segunda petición ya ve el precio nuevo ⇒ `201, 400`), el script reintenta solo, hasta 5 veces.


------------------------
Alumno: Aaron Fuenzalida
------------------------
