using EnthCollab.Api.Controllers;
using EnthCollab.Api.Dtos;
using EnthCollab.Api.Services;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Tests.Controllers;

public class ProjectsControllerTests
{
    private static EnthCollabDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<EnthCollabDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new EnthCollabDbContext(options);
    }

    private sealed class FakeProjectService : IProjectService
    {
        public Task<List<ProjectSummaryDto>> GetProjectsAsync(int? userId, string? tag) =>
            Task.FromResult(new List<ProjectSummaryDto>());
    }

    [Fact]
    public async Task GetProject_ReturnsNotFound_WhenMissing()
    {
        await using var db = CreateDbContext();
        var controller = new ProjectsController(db, new FakeProjectService(), null!);

        var result = await controller.GetProject(42);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetProjectsByUser_ReturnsMatchingProjects()
    {
        await using var db = CreateDbContext();
        var tag = new Tag { Id = 1, Name = "C#" };
        db.Tags.Add(tag);
        db.Projects.AddRange(
            new Project { Id = 1, Name = "Proj A", Description = "D1", CreatedByUserId = 10, Tags = [tag] },
            new Project { Id = 2, Name = "Proj B", Description = "D2", CreatedByUserId = 20, Tags = [tag] }
        );
        await db.SaveChangesAsync();

        var controller = new ProjectsController(db, new FakeProjectService(), null!);

        var actionResult = await controller.GetProjectsByUser(10);
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var items = Assert.IsAssignableFrom<IEnumerable<Project>>(okResult.Value);

        Assert.Single(items);
        Assert.Equal("Proj A", items.First().Name);
    }
}