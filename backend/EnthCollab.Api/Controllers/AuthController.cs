using EnthCollab.Api.Dtos;
using EnthCollab.Api.Services;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")] 
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto) => Ok(await auth.RegisterAsync(dto));

    [HttpPost("login")] 
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto) => Ok(await auth.LoginAsync(dto));

    [HttpPost("refresh")] 
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshRequestDto dto) => Ok(await auth.RefreshAsync(dto.RefreshToken));

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequestDto dto) { await auth.LogoutAsync(dto.RefreshToken); return NoContent(); }
}