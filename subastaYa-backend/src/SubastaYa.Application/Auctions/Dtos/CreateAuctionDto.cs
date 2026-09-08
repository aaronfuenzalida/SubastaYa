using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Application.Auctions.Dtos;

public record CreateAuctionDto(
    [Required, MaxLength(150)] string Title,
    [Required, MaxLength(2000)] string Description,
    [Required, MaxLength(500)] string ImageUrl,
    int CategoryId,
    [Range(1, 10_000_000)] decimal BasePrice,
    [Range(1, 10_000_000)] decimal MinIncrement,
    DateTime StartsAt,
    DateTime EndsAt
);
