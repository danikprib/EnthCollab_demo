using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Data.Entities;

public class AgentConversation
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AgentMessage> Messages { get; set; } = new List<AgentMessage>();
}
