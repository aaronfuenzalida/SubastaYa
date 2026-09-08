namespace SubastaYa.Application.Auctions.Dtos;

public record AuctionDetailDto(
    int Id,
    string Title,
    string Description,
    string CategoryName,
    string ImageUrl,
    string SellerName,
    decimal BasePrice,
    decimal MinIncrement,
    decimal CurrentPrice,
    decimal MinNextBid,
    int BidsCount,
    DateTime StartsAt,
    DateTime EndsAt,
    string Status
);
