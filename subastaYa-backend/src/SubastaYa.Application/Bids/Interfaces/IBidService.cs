using SubastaYa.Application.Bids.Dtos;

namespace SubastaYa.Application.Bids.Interfaces;

public interface IBidService
{
    Task<BidResultDto> PlaceBidAsync(int auctionId, int bidderId, PlaceBidDto dto);
    Task<List<BidDto>> GetBidsAsync(int auctionId);
}
