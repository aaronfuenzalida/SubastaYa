using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Auth.Interfaces;

public interface IJwtTokenGenerator
{
    string Generate(User user);
}
