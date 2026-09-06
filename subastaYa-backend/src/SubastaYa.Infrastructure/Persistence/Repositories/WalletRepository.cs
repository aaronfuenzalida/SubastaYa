using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Repositories;

public class WalletRepository(SubastaYaDbContext context) : IWalletRepository
{
    public Task<Wallet?> GetByUserIdAsync (int userId) =>
        context.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

    public Task<List<LedgerEntry>> GetTransactionsAsync (int walletId) =>
        context.LedgerEntries
        .Where(l => l.WalletId == walletId)
        .OrderByDescending(l => l.CreatedAt)
        .ToListAsync();

    public Task AddLedgerEntryAsync(LedgerEntry entry) 
    {
        context.LedgerEntries.Add(entry);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() =>
        context.SaveChangesAsync();
    
}