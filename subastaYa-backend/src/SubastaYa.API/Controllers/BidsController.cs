using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Bids.Dtos;
using SubastaYa.Application.Bids.Interfaces;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/auctions/{auctionId}/bids")]
public class BidsController(IBidService bidService) : ControllerBase
{
    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<BidDto>>> GetBids(int auctionId) =>
        Ok(await bidService.GetBidsAsync(auctionId));

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<BidResultDto>> PlaceBid(int auctionId, PlaceBidDto dto)
    {
        var result = await bidService.PlaceBidAsync(auctionId, CurrentUserId, dto);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
