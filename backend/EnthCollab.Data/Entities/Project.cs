namespace EnthCollab.Data.Entities;

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; } = ProjectStatus.WIP;
    public ProjectVisibility Visibility { get; set; } = ProjectVisibility.Public;
    public string Description { get; set; } = string.Empty;
    public List<Tag> Tags { get; set; } = new();

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}