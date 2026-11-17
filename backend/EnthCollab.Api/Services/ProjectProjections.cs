using EnthCollab.Api.Dtos;
using EnthCollab.Data.Entities;
using System.Linq.Expressions;

namespace EnthCollab.Api.Services;

public static class ProjectProjections
{
    public static Expression<Func<Project, ProjectSummaryDto>> ToSummary(int? userId) => p => new ProjectSummaryDto
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Status = p.Status,
        OwnerUsername = p.CreatedByUser.Username,
        LikesCount = p.Likes.Count,
        LikedByMe = userId != null && p.Likes.Any(l => l.UserId == userId),
        Tags = p.Tags.Select(t => t.Name).ToList()
    };
}
