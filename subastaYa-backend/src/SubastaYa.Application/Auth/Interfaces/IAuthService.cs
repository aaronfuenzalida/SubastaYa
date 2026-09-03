using SubastaYa.Application.Auth.Dtos;

namespace SubastaYa.Application.Auth.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
}
