using SubastaYa.Application.Categories.Dtos;
using SubastaYa.Application.Categories.Interfaces;
using SubastaYa.Application.Common.Interfaces;

namespace SubastaYa.Application.Categories.Services;

public class CategoryService(ICategoryRepository categories) : ICategoryService
{
    public async Task<List<CategoryDto>> GetAllAsync()
    {
        var list = await categories.GetAllAsync();
        return list.Select(c => new CategoryDto(c.Id, c.Name, c.IconUrl)).ToList();
    }
}