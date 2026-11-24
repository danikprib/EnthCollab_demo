using EnthCollab.Api.Dtos;
using EnthCollab.Api.Exceptions;
using EnthCollab.Api.Services;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Tests.Services;

public class UserServiceTests
{
    private static EnthCollabDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<EnthCollabDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new EnthCollabDbContext(options);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsProfileDto_WhenUserExists()
    {
        await using var db = CreateDbContext();
        var tag = new Tag { Id = 1, Name = "C#" };
        var user = new User
        {
            Id = 1,
            Username = "alice",
            Email = "alice@example.com",
            PasswordHash = "hashed",
            FirstName = "Alice",
            LastName = null,
            Bio = "Backend dev",
            Tags = [tag]
        };

        db.Tags.Add(tag);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var result = await service.GetUserAsync(1);

        Assert.NotNull(result);
        Assert.Equal("alice", result.Username);
        Assert.Equal("Alice", result.FirstName);
        Assert.Equal(string.Empty, result.LastName);
        Assert.Contains(1, result.TagIds);
    }

    [Fact]
    public async Task UpdateUserAsync_ThrowsConflictException_WhenUsernameIsTaken()
    {
        await using var db = CreateDbContext();
        db.Users.AddRange(
            new User { Id = 1, Username = "alice", Email = "a@example.com", PasswordHash = "h1" },
            new User { Id = 2, Username = "bob", Email = "b@example.com", PasswordHash = "h2" }
        );
        await db.SaveChangesAsync();

        var service = new UserService(db);
        var updateDto = new UserProfileDto { Username = "Alice" };

        await Assert.ThrowsAsync<ConflictException>(() => service.UpdateUserAsync(2, updateDto));
    }

    [Fact]
    public async Task UpdateUserAsync_UpdatesProfileAndTags_WithoutChangingEmail()
    {
        await using var db = CreateDbContext();
        var tag1 = new Tag { Id = 1, Name = "Angular" };
        var tag2 = new Tag { Id = 2, Name = ".NET" };
        var user = new User
        {
            Id = 1,
            Username = "alice",
            Email = "alice@example.com",
            PasswordHash = "hashed",
            Bio = ""
        };

        db.Tags.AddRange(tag1, tag2);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var service = new UserService(db);
        var updateDto = new UserProfileDto
        {
            Username = "alice_updated",
            FirstName = "Alice",
            LastName = "Smith",
            Bio = "Full-stack builder",
            TagIds = [2]
        };

        var updated = await service.UpdateUserAsync(1, updateDto);

        Assert.NotNull(updated);
        Assert.Equal("alice_updated", updated.Username);
        Assert.Equal("alice@example.com", updated.Email);
        Assert.Equal("Alice", updated.FirstName);
        Assert.Equal("Smith", updated.LastName);
        Assert.Equal("Full-stack builder", updated.Bio);
        Assert.Equal([2], updated.TagIds);
    }

    [Fact]
    public async Task GetUserAsync_ReturnsNull_WhenUserDoesNotExist()
    {
        await using var db = CreateDbContext();
        var service = new UserService(db);

        var result = await service.GetUserAsync(999);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetUsersAsync_ReturnsAllUsersWithProjectCounts()
    {
        await using var db = CreateDbContext();
        db.Users.AddRange(
            new User { Id = 1, Username = "alice", Email = "alice@example.com", PasswordHash = "h1" },
            new User { Id = 2, Username = "bob", Email = "bob@example.com", PasswordHash = "h2" }
        );
        db.Projects.AddRange(
            new Project { Id = 10, Name = "P1", Description = "Desc 1", CreatedByUserId = 1 },
            new Project { Id = 11, Name = "P2", Description = "Desc 2", CreatedByUserId = 1 }
        );
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var result = await service.GetUsersAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal(2, result.First(u => u.Id == 1).ProjectsCount);
        Assert.Equal(0, result.First(u => u.Id == 2).ProjectsCount);
    }

    [Fact]
    public async Task UpdateUserAsync_ThrowsArgumentException_WhenUsernameIsBlank()
    {
        await using var db = CreateDbContext();
        db.Users.Add(new User
        {
            Id = 1,
            Username = "alice",
            Email = "alice@example.com",
            PasswordHash = "h1"
        });
        await db.SaveChangesAsync();

        var service = new UserService(db);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.UpdateUserAsync(1, new UserProfileDto { Username = "   " }));
    }

    [Fact]
    public async Task UpdateUserAsync_ClearsTags_WhenEmptyTagIdsPassed()
    {
        await using var db = CreateDbContext();
        var tag = new Tag { Id = 1, Name = "Angular" };
        db.Tags.Add(tag);
        db.Users.Add(new User
        {
            Id = 1,
            Username = "alice",
            Email = "alice@example.com",
            PasswordHash = "h1",
            Tags = [tag]
        });
        await db.SaveChangesAsync();

        var service = new UserService(db);

        var updated = await service.UpdateUserAsync(1, new UserProfileDto
        {
            Username = "alice",
            TagIds = []
        });

        Assert.NotNull(updated);
        Assert.Empty(updated.TagIds);
    }
}