using EnthCollab.Api.Dtos;
using EnthCollab.Api.Extensions;
using EnthCollab.Api.Services;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController(EnthCollabDbContext context, IProjectService projects, ILikeService likes) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetProjects([FromQuery] string? tag) =>
        Ok(await projects.GetProjectsAsync(User.TryGetUserId(), tag));

    [Authorize]
    [HttpGet("liked")]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetLikedProjects() =>
        Ok(await likes.GetLikedProjectsAsync(User.GetUserId()));

    [Authorize]
    [HttpPut("{id:int}/like")]
    public async Task<IActionResult> Like(int id) { await likes.LikeAsync(User.GetUserId(), id); return NoContent(); }

    [Authorize]
    [HttpDelete("{id:int}/like")]
    public async Task<IActionResult> Unlike(int id) { await likes.UnlikeAsync(User.GetUserId(), id); return NoContent(); }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<object>> GetProject(int id)
    {
        var project = await context.Projects
            .AsNoTracking()
            .Include(p => p.Tags)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var currentUserId = User.TryGetUserId();
        if (project.Visibility == ProjectVisibility.Private && project.CreatedByUserId != currentUserId)
        {
            return NotFound();
        }

        return Ok(new
        {
            project.Id,
            project.Name,
            project.Status,
            project.Visibility,
            project.Description,
            project.Hazard,
            project.EstimatedDuration,
            project.CreatedByUserId,
            Tags = project.Tags.Select(t => t.Name).ToList(),
            LikesCount = project.Likes.Count,
            LikedByMe = currentUserId.HasValue && project.Likes.Any(l => l.UserId == currentUserId.Value)
        });
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
    public async Task<ActionResult<IEnumerable<object>>> GetProjectsByUser(int userId)
    {
        var currentUserId = User.TryGetUserId();
        var isOwner = currentUserId.HasValue && currentUserId.Value == userId;

        var query = context.Projects
            .AsNoTracking()
            .Where(p => p.CreatedByUserId == userId);

        if (!isOwner)
        {
            query = query.Where(p => p.Visibility == ProjectVisibility.Public);
        }

        var userProjects = await query
            .Include(p => p.Tags)
            .Include(p => p.Likes)
            .OrderByDescending(p => p.Id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Status,
                p.Visibility,
                p.Description,
                p.Hazard,
                p.EstimatedDuration,
                p.CreatedByUserId,
                Tags = p.Tags.Select(t => t.Name).ToList(),
                LikesCount = p.Likes.Count,
                LikedByMe = currentUserId.HasValue && p.Likes.Any(l => l.UserId == currentUserId.Value)
            })
            .ToListAsync();

        return Ok(userProjects);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> UpdateProject(int id, [FromBody] CreateProjectDto dto)
    {
        var project = await context.Projects
            .Include(p => p.Tags)
            .Include(p => p.Likes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var currentUserId = User.GetUserId();
        if (project.CreatedByUserId != currentUserId)
        {
            return Forbid();
        }

        var selectedTags = await context.Tags
            .Where(t => dto.TagIds.Contains(t.Id))
            .ToListAsync();

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.Status = dto.Status;
        project.Visibility = dto.Visibility;
        project.Hazard = dto.Hazard;
        project.Tags = selectedTags;

        await context.SaveChangesAsync();

        return Ok(new
        {
            project.Id,
            project.Name,
            project.Status,
            project.Visibility,
            project.Description,
            project.Hazard,
            project.EstimatedDuration,
            project.CreatedByUserId,
            Tags = project.Tags.Select(t => t.Name).ToList(),
            LikesCount = project.Likes.Count,
            LikedByMe = project.Likes.Any(l => l.UserId == currentUserId)
        });
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var project = await context.Projects.FirstOrDefaultAsync(p => p.Id == id);
        if (project == null)
        {
            return NotFound();
        }

        if (project.CreatedByUserId != User.GetUserId())
        {
            return Forbid();
        }

        context.Projects.Remove(project);
        await context.SaveChangesAsync();
        return NoContent();
    }
}