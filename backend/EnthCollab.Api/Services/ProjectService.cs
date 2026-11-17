using EnthCollab.Api.Dtos;
using EnthCollab.Api.Exceptions;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Services;

public interface IProjectService { Task<List<ProjectSummaryDto>> GetProjectsAsync(int? userId, string? tag); }

public class ProjectService(EnthCollabDbContext _context) : IProjectService
{
    public Task<List<ProjectSummaryDto>> GetProjectsAsync(int? userId, string? tag)
    {
        var query = _context.Projects.AsNoTracking()
            .Where(p => p.Visibility == ProjectVisibility.Public || p.CreatedByUserId == userId);
        if (!string.IsNullOrWhiteSpace(tag)) query = query.Where(p => p.Tags.Any(t => t.Name == tag));
        return query.OrderByDescending(p => p.Id).Select(ProjectProjections.ToSummary(userId)).ToListAsync();
    }
}