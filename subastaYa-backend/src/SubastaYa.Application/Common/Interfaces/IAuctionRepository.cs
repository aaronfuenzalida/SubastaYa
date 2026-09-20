using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Common.Dtos;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface IAuctionRepository
{
    Task<PagedResultDto<AuctionSummaryDto>> GetPagedAsync(AuctionFilterDto filter);
    Task<List<ParticipationDto>> GetParticipationsAsync(int userId);
    Task<List<AuctionSummaryDto>> GetBySellerAsync(int sellerId);
    Task<Auction?> GetByIdAsync(int id);
    Task<List<Auction>> GetExpiredActiveAsync(DateTime now);
    Task<List<Auction>> GetScheduledStartedAsync(DateTime now);
    Task AddAsync(Auction auction);
}
