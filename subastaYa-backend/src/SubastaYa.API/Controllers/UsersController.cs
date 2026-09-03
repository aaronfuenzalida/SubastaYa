using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Auth.Dtos;
using SubastaYa.Application.Auth.Interfaces;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController(IAuthService authService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterUserDto dto)
    {
        var response = await authService.RegisterAsync(dto);
        return Created($"/api/v1/users/{response.UserId}", response);
    }
}
