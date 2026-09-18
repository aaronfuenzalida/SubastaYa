using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Auctions.Interfaces;

namespace SubastaYa.API.Controllers;

// Recursos del usuario autenticado
[ApiController]
[Route("api/v1/me")]
[Authorize]
public class MeController(IAuctionService auctionService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("participations")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<ParticipationDto>>> GetParticipations() =>
        Ok(await auctionService.GetParticipationsAsync(CurrentUserId));

    [HttpGet("auctions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<AuctionSummaryDto>>> GetMyAuctions() =>
        Ok(await auctionService.GetMyAuctionsAsync(CurrentUserId));
}
