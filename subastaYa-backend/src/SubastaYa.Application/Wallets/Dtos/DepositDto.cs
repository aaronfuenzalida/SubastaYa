using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Application.Wallets.Dtos;

public record DepositDto([Range(1, 10_000_000)] decimal Amount);