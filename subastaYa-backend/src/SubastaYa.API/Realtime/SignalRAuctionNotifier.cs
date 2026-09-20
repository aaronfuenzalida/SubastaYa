using Microsoft.AspNetCore.SignalR;
using SubastaYa.API.Hubs;
using SubastaYa.Application.Bids.Dtos;
using SubastaYa.Application.Common.Interfaces;

namespace SubastaYa.API.Realtime;

public class SignalRAuctionNotifier(IHubContext<AuctionHub> hub) : IAuctionNotifier
{
    public Task BidPlacedAsync(int auctionId, BidResultDto result) =>
        hub.Clients.Group(AuctionHub.GroupName(auctionId)).SendAsync("BidPlaced", result);

    public Task StatusChangedAsync(int auctionId, string status) =>
        hub.Clients.Group(AuctionHub.GroupName(auctionId)).SendAsync("AuctionStatusChanged", new { auctionId, status });
}
