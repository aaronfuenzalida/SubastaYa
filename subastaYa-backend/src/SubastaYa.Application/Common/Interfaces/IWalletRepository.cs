using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface IWalletRepository
{
    Task<Wallet?> GetByUserIdAsync (int userId);
    Task<List<LedgerEntry>> GetTransactionsAsync(int walletId);
    Task AddLedgerEntryAsync (LedgerEntry entry);
    Task SaveChangesAsync();
}