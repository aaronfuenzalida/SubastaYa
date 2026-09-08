using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Categories.Interfaces;
using SubastaYa.Application.Categories.Dtos;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll() =>
        Ok(await categoryService.GetAllAsync());

}