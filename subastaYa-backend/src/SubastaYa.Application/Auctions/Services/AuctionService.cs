using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Auctions.Interfaces;
using SubastaYa.Application.Common.Dtos;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Enums;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Auctions.Services;

public class AuctionService(IAuctionRepository auctions, ICategoryRepository categories) : IAuctionService
{
    public Task<PagedResultDto<AuctionSummaryDto>> GetAuctionsAsync(AuctionFilterDto filter) =>
        auctions.GetPagedAsync(filter);

    public Task<List<ParticipationDto>> GetParticipationsAsync(int userId) =>
        auctions.GetParticipationsAsync(userId);

    public Task<List<AuctionSummaryDto>> GetMyAuctionsAsync(int sellerId) =>
        auctions.GetBySellerAsync(sellerId);

    public async Task<AuctionDetailDto> GetByIdAsync(int id, int? currentUserId = null)
    {
        var auction = await auctions.GetByIdAsync(id) ?? throw new AuctionNotFoundException(id);
        return ToDetailDto(auction, currentUserId);
    }

    public async Task<AuctionDetailDto> CreateAsync(int sellerId, CreateAuctionDto dto)
    {
        if (dto.EndsAt <= dto.StartsAt)
            throw new InvalidAuctionDatesException("EndsAt must be after StartsAt.");

        if (dto.EndsAt <= DateTime.UtcNow)
            throw new InvalidAuctionDatesException("EndsAt must be in the future.");

        if (!await categories.ExistsAsync(dto.CategoryId))
            throw new CategoryNotFoundException(dto.CategoryId);

        var auction = new Auction
        {
            SellerId = sellerId,
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            BasePrice = dto.BasePrice,
            MinIncrement = dto.MinIncrement,
            StartsAt = dto.StartsAt,
            EndsAt = dto.EndsAt,
            Status = dto.StartsAt <= DateTime.UtcNow ? AuctionStatus.Active : AuctionStatus.Scheduled
        };

        await auctions.AddAsync(auction);

        // Relectura a proposito: la entidad recién insertada solo tiene los ids, no las
        // navegaciones Category/Seller que el DTO de respuesta necesita
        return await GetByIdAsync(auction.Id);
    }

    private static AuctionDetailDto ToDetailDto(Auction a, int? currentUserId = null)
    {
        var topBid = a.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
        var currentPrice = topBid?.Amount ?? a.BasePrice;

        return new AuctionDetailDto(
            a.Id,
            a.Title,
            a.Description,
            a.Category.Name,
            a.ImageUrl,
            a.Seller.Name,
            a.BasePrice,
            a.MinIncrement,
            currentPrice,
            currentPrice + a.MinIncrement,
            a.Bids.Count,
            a.StartsAt,
            a.EndsAt,
            a.Status.ToString(),
            // Si esta activa significa "estas liderando",
            // Si esta finalizada significa "ganaste".
            topBid is not null && currentUserId == topBid.BidderId);
    }
}
