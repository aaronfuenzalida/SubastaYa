using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Application.Bids.Dtos;

public record PlaceBidDto([Range(1, 100_000_000)] decimal Amount);
