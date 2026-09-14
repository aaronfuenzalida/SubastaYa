using System.Text.Json;
using SubastaYa.Application.Bids.Dtos;
using SubastaYa.Application.Bids.Interfaces;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Bids.Services;

public class BidService(
    IAuctionRepository auctions,
    IWalletRepository wallets,
    IBidRepository bids,
    IAuditLogRepository auditLogs,
    IUnitOfWork unitOfWork) : IBidService
{
    private const int AntiSnipingWindowSeconds = 60;
    private const int AntiSnipingExtensionMinutes = 2;

    public async Task<BidResultDto> PlaceBidAsync(int auctionId, int bidderId, PlaceBidDto dto)
    {
        var auction = await auctions.GetByIdAsync(auctionId)
            ?? throw new AuctionNotFoundException(auctionId);

        var now = DateTime.UtcNow;

        if (auction.Status != AuctionStatus.Active || now < auction.StartsAt || now >= auction.EndsAt)
            throw new AuctionNotActiveException();

        if (auction.SellerId == bidderId)
            throw new InvalidBidException("You cannot bid on your own auction.");

        var leadingBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();

        if (leadingBid?.BidderId == bidderId)
            throw new InvalidBidException("You are already the leading bidder.");

        var currentPrice = leadingBid?.Amount ?? auction.BasePrice;
        var minRequired = currentPrice + auction.MinIncrement;

        if (dto.Amount < minRequired)
            throw new BidTooLowException(minRequired);

        var bidderWallet = await wallets.GetByUserIdAsync(bidderId)
            ?? throw new WalletNotFoundException(bidderId);

        if (bidderWallet.AvailableBalance < dto.Amount)
            throw new InsufficientFundsException();

        // a partir de aca todos los cambios se acumulan y entran juntos en el unico
        // SaveChanges del final
        if (leadingBid is not null)
        {
            var previousWallet = await wallets.GetByUserIdAsync(leadingBid.BidderId)
                ?? throw new WalletNotFoundException(leadingBid.BidderId);

            previousWallet.HeldBalance -= leadingBid.Amount;
            await wallets.AddLedgerEntryAsync(new LedgerEntry
            {
                WalletId = previousWallet.Id,
                Type = TransactionType.Release,
                Amount = leadingBid.Amount,
                CreatedAt = now,
                AuctionId = auction.Id
            });
        }

        bidderWallet.HeldBalance += dto.Amount;
        await wallets.AddLedgerEntryAsync(new LedgerEntry
        {
            WalletId = bidderWallet.Id,
            Type = TransactionType.Hold,
            Amount = dto.Amount,
            CreatedAt = now,
            AuctionId = auction.Id
        });

        var bid = new Bid
        {
            AuctionId = auction.Id,
            BidderId = bidderId,
            Amount = dto.Amount,
            PlacedAt = now
        };
        bids.Add(bid);

        var timeExtended = false;
        if ((auction.EndsAt - now).TotalSeconds <= AntiSnipingWindowSeconds)
        {
            var oldEndsAt = auction.EndsAt;
            auction.EndsAt = auction.EndsAt.AddMinutes(AntiSnipingExtensionMinutes);
            timeExtended = true;

            auditLogs.Add(new AuditLog
            {
                Entity = "Auction",
                EntityId = auction.Id,
                Action = AuditActions.TimeExtended,
                UserId = bidderId,
                DetailsJson = JsonSerializer.Serialize(new { oldEndsAt, newEndsAt = auction.EndsAt }),
                CreatedAt = now
            });
        }

        // Toda puja escribe la fila de la subasta para que
        // "Version" arbitre las carreras (esto es la concurrencia)
        auction.Version++;

        await unitOfWork.SaveChangesAsync();

        return new BidResultDto(
            new BidDto(bid.Id, bid.Amount, Anonymize(bidderWallet.User.Name), bid.PlacedAt),
            bid.Amount,
            bid.Amount + auction.MinIncrement,
            auction.EndsAt,
            timeExtended);
    }

    public async Task<List<BidDto>> GetBidsAsync(int auctionId)
    {
        _ = await auctions.GetByIdAsync(auctionId)
            ?? throw new AuctionNotFoundException(auctionId);

        var list = await bids.GetByAuctionAsync(auctionId);

        return list
            .Select(b => new BidDto(b.Id, b.Amount, Anonymize(b.Bidder.Name), b.PlacedAt))
            .ToList();
    }

    private static string Anonymize(string name) =>
        name.Length <= 1 ? "***" : $"{name[0]}***";
}
