using SubastaYa.Application.Auctions.Interfaces;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Auctions.Services;

public class AuctionFinalizerService(
    IAuctionRepository auctions,
    IWalletRepository wallets,
    IUnitOfWork unitOfWork) : IAuctionFinalizerService
{
    public async Task ProcessExpiredAuctionsAsync()
    {
        var expired = await auctions.GetExpiredActiveAsync(DateTime.UtcNow);

        foreach (var auction in expired)
        {
            var winningBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();

            if (winningBid is null)
            {
                auction.Status = AuctionStatus.Deserted;
            }
            else
            {
                await SettleAsync(auction, winningBid);
                auction.Status = AuctionStatus.Finished;
            }

            // TODO (auditoria): registrar el cambio de estado ejecutado por el worker
            auction.Version++;

            // Un save por subasta :si una liquidacion falla, las anteriores ya
            // quedaron confirmadas y solo esta se reintenta en el proximo tick.
            await unitOfWork.SaveChangesAsync();
        }
    }

    private async Task SettleAsync(Auction auction, Bid winningBid)
    {
        var buyerWallet = await wallets.GetByUserIdAsync(winningBid.BidderId)
            ?? throw new WalletNotFoundException(winningBid.BidderId);
        var sellerWallet = await wallets.GetByUserIdAsync(auction.SellerId)
            ?? throw new WalletNotFoundException(auction.SellerId);

        var now = DateTime.UtcNow;

        buyerWallet.TotalBalance -= winningBid.Amount;
        buyerWallet.HeldBalance -= winningBid.Amount;
        await wallets.AddLedgerEntryAsync(new LedgerEntry
        {
            WalletId = buyerWallet.Id,
            Type = TransactionType.Payment,
            Amount = winningBid.Amount,
            CreatedAt = now,
            AuctionId = auction.Id
        });

        sellerWallet.TotalBalance += winningBid.Amount;
        await wallets.AddLedgerEntryAsync(new LedgerEntry
        {
            WalletId = sellerWallet.Id,
            Type = TransactionType.Payout,
            Amount = winningBid.Amount,
            CreatedAt = now,
            AuctionId = auction.Id
        });
    }
}
