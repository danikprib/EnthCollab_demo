using EnthCollab.Api.Dtos;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class UsersController : ControllerBase
{
    private readonly EnthCollabDbContext _context;

    public UsersController(EnthCollabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserProfileDto>> GetUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound();
        }

        var projectsCount = await _context.Projects.CountAsync(p => p.CreatedByUserId == id);

        var profile = new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            MemberSince = user.MemberSince,
            ProjectsCount = projectsCount,
        };

        return Ok(profile);
    }

}
