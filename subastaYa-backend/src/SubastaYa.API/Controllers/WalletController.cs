using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Wallets.Dtos;
using SubastaYa.Application.Wallets.Interfaces;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/wallet")]
[Authorize]
public class WalletController(IWalletService walletService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WalletBalanceDto>> GetBalance() =>
        Ok(await walletService.GetBalanceAsync(CurrentUserId));

    [HttpPost("deposits")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<WalletBalanceDto>> Deposit(DepositDto dto)
    {
        var balance = await walletService.DepositAsync(CurrentUserId, dto);
        return StatusCode(StatusCodes.Status201Created, balance);
    }

    [HttpGet("transactions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<TransactionDto>>> GetTransactions() =>
        Ok(await walletService.GetTransactionsAsync(CurrentUserId));
}
