using EnthCollab.Api.Dtos;
using EnthCollab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService users) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UserProfileDto>>> GetUsers(CancellationToken ct) =>
        Ok(await users.GetUsersAsync(ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserProfileDto>> GetUser(int id, CancellationToken ct)
    {
        var profile = await users.GetUserAsync(id, ct);
        return profile is null ? NotFound() : Ok(profile);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<UserProfileDto>> UpdateUser(
        int id,
        [FromBody] UserProfileDto dto,
        CancellationToken ct)
    {
        try
        {
            var updated = await users.UpdateUserAsync(id, dto, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}