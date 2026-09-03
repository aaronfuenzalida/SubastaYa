using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
}
