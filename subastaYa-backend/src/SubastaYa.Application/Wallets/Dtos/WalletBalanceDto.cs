namespace SubastaYa.Application.Wallets.Dtos;

public record WalletBalanceDto(decimal TotalBalance,
    decimal HeldBalance,
    decimal AvailableBalance);