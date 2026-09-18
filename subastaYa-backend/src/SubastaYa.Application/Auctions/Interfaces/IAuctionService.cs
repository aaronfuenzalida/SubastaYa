using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Common.Dtos;

namespace SubastaYa.Application.Auctions.Interfaces;

public interface IAuctionService
{
    Task<PagedResultDto<AuctionSummaryDto>> GetAuctionsAsync(AuctionFilterDto filter);
    Task<AuctionDetailDto> GetByIdAsync(int id, int? currentUserId = null);
    Task<AuctionDetailDto> CreateAsync(int sellerId, CreateAuctionDto dto);
}
