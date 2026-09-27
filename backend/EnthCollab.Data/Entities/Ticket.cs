namespace EnthCollab.Data.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public TicketStatus Status { get; set; } = TicketStatus.Open;
    public TicketDifficulty Difficulty { get; set; } = TicketDifficulty.Easy;
    public string Description { get; set; } = string.Empty;

    // Collection of Enum tags
    public List<Tag> Tags { get; set; } = new();

    // Foreign Key connecting Ticket to a Project
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}