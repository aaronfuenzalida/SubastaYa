using Microsoft.AspNetCore.SignalR;

namespace SubastaYa.API.Hubs;

// Sala en vivo: cada espectador se une al grupo de la subasta que esta mirando
// y solo recibe los eventos de esa subasta.
public class AuctionHub : Hub
{
    public static string GroupName(int auctionId) => $"auction-{auctionId}";

    public Task JoinAuction(int auctionId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GroupName(auctionId));

    public Task LeaveAuction(int auctionId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(auctionId));
}
