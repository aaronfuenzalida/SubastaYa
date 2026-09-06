namespace SubastaYa.Application.Wallets.Dtos;

public record TransactionDto(int Id,
    string Type,
    decimal Amount,
    DateTime CreatedAt,
    int? AuctionId
);