using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Repositories;

public class BidRepository(SubastaYaDbContext context) : IBidRepository
{
    // Sin SaveChanges ya que la puja se confirma junto con las billeteras y subasta en la
    // unica transaccion del UnitOfWork.
    public void Add(Bid bid) => context.Bids.Add(bid);

    public Task<List<Bid>> GetByAuctionAsync(int auctionId) =>
        context.Bids
            .Where(b => b.AuctionId == auctionId)
            .Include(b => b.Bidder)
            .OrderByDescending(b => b.PlacedAt)
            .ToListAsync();
}
