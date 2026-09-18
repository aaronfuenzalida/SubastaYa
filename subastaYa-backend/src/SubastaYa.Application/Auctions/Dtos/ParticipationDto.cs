namespace SubastaYa.Application.Auctions.Dtos;

public record ParticipationDto(
    int AuctionId,
    string Title,
    string ImageUrl,
    string Status,
    DateTime EndsAt,
    decimal CurrentPrice,
    decimal MyTopBid,
    bool IsTopBidder
);
