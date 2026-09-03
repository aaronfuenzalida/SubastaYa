using SubastaYa.Application.Auth.Dtos;
using SubastaYa.Application.Auth.Interfaces;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;
using SubastaYa.Domain.Exceptions;

namespace SubastaYa.Application.Auth.Services;

public class AuthService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto dto)
    {
        if (await users.EmailExistsAsync(dto.Email))
            throw new EmailAlreadyRegisteredException(dto.Email);

        var user = new User
        {
            Email = dto.Email,
            Name = dto.Name,
            PasswordHash = passwordHasher.Hash(dto.Password),
            RegisteredAt = DateTime.UtcNow,
            Wallet = new Wallet()
        };

        await users.AddAsync(user);

        return BuildResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await users.GetByEmailAsync(dto.Email);

        if (user is null || !passwordHasher.Verify(dto.Password, user.PasswordHash))
            throw new InvalidCredentialsException();

        return BuildResponse(user);
    }

    private AuthResponseDto BuildResponse(User user) =>
        new(user.Id, user.Email, user.Name, tokenGenerator.Generate(user));
}
