namespace SubastaYa.Application.Bids.Dtos;

public record BidDto(int Id, decimal Amount, string Bidder, DateTime PlacedAt);
