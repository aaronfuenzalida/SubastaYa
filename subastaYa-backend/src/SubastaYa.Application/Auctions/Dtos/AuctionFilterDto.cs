using System.ComponentModel.DataAnnotations;
using SubastaYa.Domain.Enums;

namespace SubastaYa.Application.Auctions.Dtos;

public record AuctionFilterDto(
    AuctionStatus? Status,
    int? CategoryId,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? Sort,
    [Range(1, int.MaxValue)] int Page = 1,
    [Range(1, 50)] int PageSize = 12
);
