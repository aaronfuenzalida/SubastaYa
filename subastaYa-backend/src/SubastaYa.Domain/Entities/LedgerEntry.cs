using SubastaYa.Domain.Enums;

namespace SubastaYa.Domain.Entities;

public class LedgerEntry
{
    public int Id { get; set; }
    public int WalletId { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? AuctionId { get; set; }
    public Wallet Wallet { get; set; } = null!;
}
