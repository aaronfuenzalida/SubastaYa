using Microsoft.EntityFrameworkCore;
using SubastaYa.Application.Auctions.Dtos;
using SubastaYa.Application.Common.Dtos;
using SubastaYa.Application.Common.Interfaces;
using SubastaYa.Domain.Entities;

namespace SubastaYa.Infrastructure.Persistence.Repositories;

public class CategoryRepository (SubastaYaDbContext context) : ICategoryRepository
{
    public async Task<bool> ExistsAsync(int id) => await context.Categories.AnyAsync(c => c.Id == id);

    public async Task<List<Category>> GetAllAsync() =>
        await context.Categories.OrderBy(c => c.Name).ToListAsync();
}