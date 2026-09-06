using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Application.Wallets.Dtos;
using SubastaYa.Application.Wallets.Interfaces;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Wallets.Services;

public class WalletService(IWalletRepository wallets) : IWalletService
{
    public async Task<WalletBalanceDto> GetBalanceAsync(int userId)
    {
        var wallet = await GetWalletAsync(userId);
        return ToBalanceDto(wallet);
    }

    public async Task<WalletBalanceDto> DepositAsync(int userId, DepositDto dto)
    {
        var wallet = await GetWalletAsync(userId);

        wallet.TotalBalance += dto.Amount;
        await wallets.AddLedgerEntryAsync(new LedgerEntry
        {
            WalletId = wallet.Id,
            Type = TransactionType.Deposit,
            Amount = dto.Amount,
            CreatedAt = DateTime.UtcNow
        });

        // Un unico SaveChanges: el saldo nuevo y su asiento entran en la misma transaccion,
        // nunca puede quedar uno sin el otro.
        await wallets.SaveChangesAsync();

        return ToBalanceDto(wallet);
    }

    public async Task<List<TransactionDto>> GetTransactionsAsync(int userId)
    {
        var wallet = await GetWalletAsync(userId);
        var entries = await wallets.GetTransactionsAsync(wallet.Id);

        return entries
            .Select(e => new TransactionDto(e.Id, e.Type.ToString(), e.Amount, e.CreatedAt, e.AuctionId))
            .ToList();
    }

    private async Task<Wallet> GetWalletAsync(int userId) =>
        await wallets.GetByUserIdAsync(userId) ?? throw new WalletNotFoundException(userId);

    private static WalletBalanceDto ToBalanceDto(Wallet wallet) =>
        new(wallet.TotalBalance, wallet.HeldBalance, wallet.AvailableBalance);
}
