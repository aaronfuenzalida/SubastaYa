using SubastaYa.Application.Categories.Dtos;

namespace SubastaYa.Application.Categories.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
}
