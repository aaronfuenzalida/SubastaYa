using System.Text.Json;
using SubastaYa.Application.Auctions.Interfaces;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Auctions.Services;

public class AuctionFinalizerService(
    IAuctionRepository auctions,
    IWalletRepository wallets,
    IAuditLogRepository auditLogs,
    IUnitOfWork unitOfWork) : IAuctionFinalizerService
{
    // Las Scheduled para las cuales su hora de inicio llego pasan a Active
    public async Task StartScheduledAuctionsAsync()
    {
        var toStart = await auctions.GetScheduledStartedAsync(DateTime.UtcNow);

        foreach (var auction in toStart)
        {
            auction.Status = AuctionStatus.Active;

            auditLogs.Add(new AuditLog
            {
                Entity = "Auction",
                EntityId = auction.Id,
                Action = AuditActions.StatusChanged,
                UserId = null,
                DetailsJson = JsonSerializer.Serialize(new
                {
                    oldStatus = nameof(AuctionStatus.Scheduled),
                    newStatus = nameof(AuctionStatus.Active)
                }),
                CreatedAt = DateTime.UtcNow
            });

            auction.Version++;
            await unitOfWork.SaveChangesAsync();
        }
    }

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

            // UserId null = lo ejecuto el worker, no un usuario (se especifica en el diagrama del trabajo)
            auditLogs.Add(new AuditLog
            {
                Entity = "Auction",
                EntityId = auction.Id,
                Action = AuditActions.StatusChanged,
                UserId = null,
                DetailsJson = JsonSerializer.Serialize(new
                {
                    oldStatus = nameof(AuctionStatus.Active),
                    newStatus = auction.Status.ToString(),
                    settledAmount = winningBid?.Amount
                }),
                CreatedAt = DateTime.UtcNow
            });

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
