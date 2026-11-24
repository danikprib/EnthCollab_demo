namespace EnthCollab.Api.Dtos;

public class UpdateUserProfileDto
{
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public List<int>? TagIds { get; set; }
}
