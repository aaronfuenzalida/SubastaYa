using SubastaYa.Domain.Enums;

namespace SubastaYa.Domain.Entities;

public class Auction
{
    public int Id { get; set; }
    public int SellerId { get; set; }
    public int CategoryId { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string ImageUrl { get; set; }
    public decimal BasePrice { get; set; }
    public decimal MinIncrement { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public AuctionStatus Status { get; set; }
    public uint Version { get; set; }
    public User Seller { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public List<Bid> Bids { get; set; } = [];
}
