using EnthCollab.Api.Dtos;
using EnthCollab.Api.Exceptions;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Services;

public interface ILikeService
{
    Task LikeAsync(int userId, int projectId);
    Task UnlikeAsync(int userId, int projectId);
    Task<List<ProjectSummaryDto>> GetLikedProjectsAsync(int userId);
}

public class LikeService(EnthCollabDbContext db) : ILikeService
{
    public async Task LikeAsync(int userId, int projectId)
    {
        var project = await db.Projects.AsNoTracking().SingleOrDefaultAsync(p => p.Id == projectId);
        if (project is null || (project.Visibility == ProjectVisibility.Private && project.CreatedByUserId != userId))
            throw new NotFoundException("Project not found.");

        if (await db.ProjectLikes.AnyAsync(l => l.UserId == userId && l.ProjectId == projectId)) return;   // idempotent
        db.ProjectLikes.Add(new ProjectLike { UserId = userId, ProjectId = projectId });
        await db.SaveChangesAsync();
    }

    public async Task UnlikeAsync(int userId, int projectId)
    {
        var like = await db.ProjectLikes.FindAsync(userId, projectId);
        if (like is null) return;
        db.ProjectLikes.Remove(like);
        await db.SaveChangesAsync();
    }

    public Task<List<ProjectSummaryDto>> GetLikedProjectsAsync(int userId) =>
        db.Projects.AsNoTracking()
          .Where(p => p.Likes.Any(l => l.UserId == userId) &&
                      (p.Visibility == ProjectVisibility.Public || p.CreatedByUserId == userId))
          .OrderByDescending(p => p.Id)
          .Select(ProjectProjections.ToSummary(userId))
          .ToListAsync();
}