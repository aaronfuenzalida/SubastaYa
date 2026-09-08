using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Common.Dtos;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface IAuctionRepository
{
    Task<PagedResultDto<AuctionSummaryDto>> GetPagedAsync(AuctionFilterDto filter);
    Task<Auction?> GetByIdAsync(int id);
    Task AddAsync(Auction auction);
}
