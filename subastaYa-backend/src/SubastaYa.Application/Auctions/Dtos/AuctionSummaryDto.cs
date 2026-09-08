namespace SubastaYa.Application.Auctions.Dtos;

public record AuctionSummaryDto(
    int Id,
    string Title,
    string CategoryName,
    string ImageUrl,
    decimal CurrentPrice,
    int BidsCount,
    DateTime EndsAt,
    string Status
);
