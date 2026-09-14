namespace SubastaYa.Application.Bids.Dtos;

public record BidResultDto(
    BidDto Bid,
    decimal CurrentPrice,
    decimal MinNextBid,
    DateTime EndsAt,
    bool TimeExtended
);
