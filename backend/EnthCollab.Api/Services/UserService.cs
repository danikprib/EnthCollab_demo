using EnthCollab.Api.Dtos;
using EnthCollab.Api.Exceptions;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Services;

public interface IUserService
{
    Task<List<UserProfileDto>> GetUsersAsync(CancellationToken ct = default);
    Task<UserProfileDto?> GetUserAsync(int id, CancellationToken ct = default);
    Task<UserProfileDto?> UpdateUserAsync(int id, UserProfileDto dto, CancellationToken ct = default);
}

public class UserService(EnthCollabDbContext db) : IUserService
{
    public async Task<List<UserProfileDto>> GetUsersAsync(CancellationToken ct = default)
    {
        var users = await db.Users
            .AsNoTracking()
            .Include(u => u.Tags)
            .OrderBy(u => u.Id)
            .ToListAsync(ct);

        var projectCounts = await db.Projects
            .AsNoTracking()
            .GroupBy(p => p.CreatedByUserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, ct);

        return users.Select(u => MapToDto(u, projectCounts.GetValueOrDefault(u.Id, 0))).ToList();
    }

    public async Task<UserProfileDto?> GetUserAsync(int id, CancellationToken ct = default)
    {
        var user = await db.Users
            .AsNoTracking()
            .Include(u => u.Tags)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null)
        {
            return null;
        }

        var projectsCount = await db.Projects
            .AsNoTracking()
            .CountAsync(p => p.CreatedByUserId == id, ct);

        return MapToDto(user, projectsCount);
    }

    public async Task<UserProfileDto?> UpdateUserAsync(int id, UserProfileDto dto, CancellationToken ct = default)
    {
        var user = await db.Users
            .Include(u => u.Tags)
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user is null)
        {
            return null;
        }

        var trimmedUsername = dto.Username.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(trimmedUsername))
        {
            throw new ArgumentException("Username is required.");
        }

        var usernameTaken = await db.Users
            .AnyAsync(u => u.Id != id && u.Username.ToLower() == trimmedUsername.ToLower(), ct);

        if (usernameTaken)
        {
            throw new ConflictException("Username is already taken.");
        }

        user.Username = trimmedUsername;
        user.FirstName = string.IsNullOrWhiteSpace(dto.FirstName) ? null : dto.FirstName.Trim();
        user.LastName = string.IsNullOrWhiteSpace(dto.LastName) ? null : dto.LastName.Trim();
        user.Bio = dto.Bio ?? string.Empty;

        if (dto.TagIds is not null)
        {
            var distinctTagIds = dto.TagIds.Distinct().ToHashSet();
            var tags = await db.Tags
                .Where(t => distinctTagIds.Contains(t.Id))
                .ToListAsync(ct);

            var toRemove = user.Tags.Where(t => !distinctTagIds.Contains(t.Id)).ToList();
            foreach (var tag in toRemove)
            {
                user.Tags.Remove(tag);
            }

            var existingIds = user.Tags.Select(t => t.Id).ToHashSet();
            foreach (var tag in tags)
            {
                if (!existingIds.Contains(tag.Id))
                {
                    user.Tags.Add(tag);
                }
            }
        }

        await db.SaveChangesAsync(ct);

        var projectsCount = await db.Projects
            .AsNoTracking()
            .CountAsync(p => p.CreatedByUserId == id, ct);

        return MapToDto(user, projectsCount);
    }

    private static UserProfileDto MapToDto(User user, int projectsCount) => new()
    {
        Id = user.Id,
        Username = user.Username,
        FirstName = user.FirstName ?? string.Empty,
        LastName = user.LastName ?? string.Empty,
        Email = user.Email,
        Bio = user.Bio,
        MemberSince = user.MemberSince,
        ProjectsCount = projectsCount,
        TagIds = user.Tags.Select(t => t.Id).ToList()
    };
}