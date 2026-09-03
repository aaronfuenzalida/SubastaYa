using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Application.Auth.Dtos;

public record RegisterUserDto(
    [Required, EmailAddress, MaxLength(255)] string Email,
    [Required, MaxLength(100)] string Name,
    [Required, MinLength(8), MaxLength(72)] string Password);
