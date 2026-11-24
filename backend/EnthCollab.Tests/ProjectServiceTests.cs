using EnthCollab.Api.Services;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Tests.Services;

public class ProjectServiceTests
{
    private static EnthCollabDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<EnthCollabDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new EnthCollabDbContext(options);
    }

    [Fact]
    public async Task GetProjectsAsync_AllowsAnonymousUser_AndFiltersByTag()
    {
        await using var db = CreateDbContext();
        var owner = new User { Id = 1, Username = "alice", Email = "alice@example.com", PasswordHash = "h1" };
        var angularTag = new Tag { Id = 1, Name = "Angular" };
        var dotnetTag = new Tag { Id = 2, Name = ".NET" };

        db.Users.Add(owner);
        db.Tags.AddRange(angularTag, dotnetTag);
        db.Projects.AddRange(
            new Project
            {
                Id = 1,
                Name = "Frontend App",
                Description = "Angular UI",
                CreatedByUserId = 1,
                CreatedByUser = owner,
                Tags = [angularTag]
            },
            new Project
            {
                Id = 2,
                Name = "API Service",
                Description = ".NET Backend",
                CreatedByUserId = 1,
                CreatedByUser = owner,
                Tags = [dotnetTag]
            }
        );
        await db.SaveChangesAsync();

        var service = new ProjectService(db);

        var results = await service.GetProjectsAsync(userId: null, tag: "Angular");

        Assert.Single(results);
        Assert.Equal("Frontend App", results[0].Name);
    }
}