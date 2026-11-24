using System.ComponentModel.DataAnnotations;
using EnthCollab.Data.Constants;

namespace EnthCollab.Api.Dtos;

public class AgentChatRequestDto
{
    [Required(ErrorMessage = "Message is required.")]
    [StringLength(5000, MinimumLength = 1, ErrorMessage = "Message must be between 1 and 5000 characters.")]
    public string Message { get; set; } = string.Empty;

    public int? ProjectId { get; set; }

    [MaxLength(200)]
    public string? CurrentTitle { get; set; }

    [MaxLength(4000)]
    public string? CurrentDescription { get; set; }

    [MaxLength(2000)]
    public string? CurrentHazard { get; set; }

    public List<string> CurrentTags { get; set; } = [];
}

public class AgentMessageDto
{
    public int Id { get; set; }
    public string Role { get; set; } = AgentMessageRoles.User;
    public string Content { get; set; } = string.Empty;
    public AgentStructuredReplyDto? StructuredData { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AgentStructuredReplyDto
{
    public string Reply { get; set; } = string.Empty;
    public string? SuggestedName { get; set; }
    public string? SuggestedDescription { get; set; }
    public string? SuggestedHazard { get; set; }
    public string? EstimatedDuration { get; set; }
    public List<string> SuggestedTags { get; set; } = [];
    public List<SuggestedTicketDto> SuggestedTickets { get; set; } = [];
    public List<RecommendedProjectDto> RecommendedProjects { get; set; } = [];
    public List<RecommendedUserDto> RecommendedUsers { get; set; } = [];
}

public class SuggestedTicketDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "Medium";
}

public class RecommendedProjectDto
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class RecommendedUserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}