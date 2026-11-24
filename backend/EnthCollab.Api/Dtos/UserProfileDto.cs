using EnthCollab.Data.Constants;
using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Api.Dtos;

public class UserProfileDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public DateTime MemberSince { get; set; }
    public int ProjectsCount { get; set; }
    public List<int> TagIds { get; set; } = new();
}
