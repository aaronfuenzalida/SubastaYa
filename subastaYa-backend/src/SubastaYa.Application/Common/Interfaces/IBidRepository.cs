using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface IBidRepository
{
    void Add(Bid bid);
    Task<List<Bid>> GetByAuctionAsync(int auctionId);
}
