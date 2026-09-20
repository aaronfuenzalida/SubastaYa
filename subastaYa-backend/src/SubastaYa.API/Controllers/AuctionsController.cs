using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Auctions.Interfaces;
using SubastaYa.Application.Common.Dtos;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/auctions")]
public class AuctionsController(IAuctionService auctionService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Version opcional para endpoints publicos y si vino token valido lo usamos, si no null.
    private int? CurrentUserIdOrNull =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<AuctionSummaryDto>>> GetAuctions([FromQuery] AuctionFilterDto filter) =>
        Ok(await auctionService.GetAuctionsAsync(filter));

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuctionDetailDto>> GetById(int id) =>
        Ok(await auctionService.GetByIdAsync(id, CurrentUserIdOrNull));

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuctionDetailDto>> Create(CreateAuctionDto dto)
    {
        var auction = await auctionService.CreateAsync(CurrentUserId, dto);
        return CreatedAtAction(nameof(GetById), new { id = auction.Id }, auction);
    }
}
