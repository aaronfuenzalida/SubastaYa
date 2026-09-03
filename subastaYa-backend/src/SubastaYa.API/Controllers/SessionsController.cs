using Microsoft.AspNetCore.Mvc;
using SubastaYa.Application.Auth.Dtos;
using SubastaYa.Application.Auth.Interfaces;

namespace SubastaYa.API.Controllers;

[ApiController]
[Route("api/v1/sessions")]
public class SessionsController(IAuthService authService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto) =>
        Ok(await authService.LoginAsync(dto));
}
