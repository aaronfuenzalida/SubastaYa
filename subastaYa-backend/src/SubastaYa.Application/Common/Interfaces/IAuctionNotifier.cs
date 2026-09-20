using SubastaYa.Application.Bids.Dtos;

namespace SubastaYa.Application.Common.Interfaces;

// Abstraccion de notificaciones en tiempo real. Application anuncia eventos
// sin saber que abajo esta SignalR (la implementacion vive en la capa API).
public interface IAuctionNotifier
{
    Task BidPlacedAsync(int auctionId, BidResultDto result);
    Task StatusChangedAsync(int auctionId, string status);
}
