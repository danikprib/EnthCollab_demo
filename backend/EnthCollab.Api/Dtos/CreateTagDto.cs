using EnthCollab.Data.Constants;
using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Api.Dtos;

public class CreateTagDto 
{ 
    [Required] 
    [MaxLength(TagConstants.MaxNameLength)]
    public string Name { get; set; } = ""; 
}