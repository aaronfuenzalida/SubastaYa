namespace SubastaYa.Application.Auctions.Interfaces;

public interface IAuctionFinalizerService
{
    Task ProcessExpiredAuctionsAsync();
}
