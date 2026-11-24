using EnthCollab.Data.Constants;
using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Data.Entities;

public class AgentMessage
{
    public int Id { get; set; }

    public int ConversationId { get; set; }
    public AgentConversation Conversation { get; set; } = null!;
    
    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = AgentMessageRoles.User;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? StructuredPayloadJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
