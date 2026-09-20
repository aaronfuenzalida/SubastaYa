namespace SubastaYa.Application.Auctions.Interfaces;

public interface IAuctionFinalizerService
{
    Task StartScheduledAuctionsAsync();
    Task ProcessExpiredAuctionsAsync();
}
