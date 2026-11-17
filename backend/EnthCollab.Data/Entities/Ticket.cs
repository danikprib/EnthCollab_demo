using System.ComponentModel.DataAnnotations;
using EnthCollab.Data.Constants;

namespace EnthCollab.Data.Entities;

public class Ticket
{
    public int Id { get; set; }

    [MaxLength(TicketConstants.MaxTicketNameLength, ErrorMessage = "Ticket name must be less than 150 characters")]
    public string Name { get; set; }
    public TicketStatus Status { get; set; }
    public TicketDifficulty Difficulty { get; set; }

    [MaxLength(TicketConstants.MaxTicketDescriptionLength, ErrorMessage = "Ticket description must be less than 1000 characters")]
    public string Description { get; set; } = string.Empty;

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}