using EnthCollab.Data.Entities;

namespace EnthCollab.Api.Dtos;

public class ProjectSummaryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public ProjectStatus Status { get; set; }
    public string OwnerUsername { get; set; } = "";
    public int LikesCount { get; set; }
    public bool LikedByMe { get; set; }
    public List<string> Tags { get; set; } = new();
}