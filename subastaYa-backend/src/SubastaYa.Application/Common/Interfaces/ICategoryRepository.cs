using SubastaYa.Domain.Entities;

namespace SubastaYa.Application.Common.Interfaces;

public interface ICategoryRepository
{
    Task<bool> ExistsAsync(int id);
    Task<List<Category>> GetAllAsync();
}
