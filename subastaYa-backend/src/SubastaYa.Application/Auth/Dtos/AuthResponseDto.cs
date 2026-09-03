namespace SubastaYa.Application.Auth.Dtos;

public record AuthResponseDto(int UserId, string Email, string Name, string Token);
