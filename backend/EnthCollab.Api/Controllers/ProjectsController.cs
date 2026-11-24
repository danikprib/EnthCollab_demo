using EnthCollab.Api.Dtos;
using EnthCollab.Api.Extensions;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using EnthCollab.Api.Services;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ProjectsController(EnthCollabDbContext context, IProjectService projects, ILikeService likes) : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetProjects([FromQuery] string? tag) =>
        Ok(await projects.GetProjectsAsync(User.TryGetUserId(), tag));

    [Authorize]
    [HttpPut("{id:int}/like")]
    public async Task<IActionResult> Like(int id) { await likes.LikeAsync(User.GetUserId(), id); return NoContent(); }

    [Authorize] 
    [HttpDelete("{id:int}/like")]
    public async Task<IActionResult> Unlike(int id) { await likes.UnlikeAsync(User.GetUserId(), id); return NoContent(); }


    [HttpGet("{id:int}")]
    public async Task<ActionResult<Project>> GetProject(int id)
    {
        var project = await context.Projects.FindAsync(id);

        if (project == null)
        {
            return NotFound();
        }

        return project;
    }

    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectDto dto)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = userIdClaim != null ? int.Parse(userIdClaim) : 1;
        
        var selectedTags = await context.Tags
            .Where(t => dto.TagIds.Contains(t.Id))
            .ToListAsync();

        var project = new Project
        {
            Name = dto.Name,
            Status = dto.Status,
            Visibility = dto.Visibility,
            Description = dto.Description,
            Hazard = dto.Hazard,
            CreatedByUserId = userId,
            Tags = selectedTags
        };

        context.Projects.Add(project);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjectsByUser(int userId)
    {
        var projects = await context.Projects
            .Where(p => p.CreatedByUserId == userId)
            .Include(p => p.Tags)
            .ToListAsync();

        return Ok(projects);
    }
}
