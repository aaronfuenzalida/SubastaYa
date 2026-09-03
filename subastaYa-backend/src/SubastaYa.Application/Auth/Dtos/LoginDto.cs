using System.ComponentModel.DataAnnotations;

namespace SubastaYa.Application.Auth.Dtos;

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Password);
