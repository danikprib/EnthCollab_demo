using System.ComponentModel.DataAnnotations;
using EnthCollab.Data.Constants;

namespace EnthCollab.Data.Entities;

public class Project
{
    public int Id { get; set; }
    public int CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;

    [Required]
    [MaxLength(ProjectConstants.MaxNameLength, ErrorMessage = "Project name must not be greater than 250 characters")]
    public string Name { get; set; }
    public ProjectStatus Status { get; set; }
    public ProjectVisibility Visibility { get; set; } = ProjectVisibility.Public;

    [MaxLength(ProjectConstants.MaxDescriptionLength, ErrorMessage = "Project description must not be greater than 5000 characters")]
    public string Description { get; set; } = string.Empty;

    [MaxLength(ProjectConstants.MaxHazardLength, ErrorMessage = "Hazard section must not be greater than 5000 characters")]
    public string Hazard { get; set; } = string.Empty;


    public ICollection<Tag> Tags { get; set; } = new List<Tag>();

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
        
    public ICollection<ProjectLike> Likes { get; set; } = new List<ProjectLike>();
}