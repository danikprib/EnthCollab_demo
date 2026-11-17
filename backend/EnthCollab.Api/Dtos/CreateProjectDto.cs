using EnthCollab.Data.Constants;
using EnthCollab.Data.Entities;
using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Api.Dtos;

public class CreateProjectDto
{
    [Required]
    [MaxLength(ProjectConstants.MaxNameLength, ErrorMessage = "Project name must not be greater than 250 characters")]
    public string Name { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; } = ProjectStatus.WIP;
    public ProjectVisibility Visibility { get; set; } = ProjectVisibility.Public;

    [MaxLength(ProjectConstants.MaxDescriptionLength, ErrorMessage = "Project description must not be greater than 5000 characters")]
    public string Description { get; set; } = string.Empty;

    [MaxLength(ProjectConstants.MaxHazardLength, ErrorMessage = "Hazard section must not be greater than 5000 characters")]
    public string Hazard { get; set; } = string.Empty;

    public List<int> TagIds { get; set; } = new();
}