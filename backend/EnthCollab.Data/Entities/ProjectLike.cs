namespace EnthCollab.Data.Entities;

public class ProjectLike
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
