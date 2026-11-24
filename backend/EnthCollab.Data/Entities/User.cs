using System.ComponentModel.DataAnnotations;
using EnthCollab.Data.Constants;

namespace EnthCollab.Data.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(UserConstants.MaxUsernameLength, ErrorMessage = "Username name must NOT be greater than 50 characters")]
    public string Username { get; set; }

    [MaxLength(UserConstants.MaxFirstNameLength, ErrorMessage = "Username name must NOT be greater than 50 characters")]
    public string? FirstName { get; set; }

    [MaxLength(UserConstants.MaxLastNameLength, ErrorMessage = "Username name must NOT be greater than 50 characters")]
    public string? LastName { get; set; }

    [MaxLength(UserConstants.BioMaxLength, ErrorMessage = "Bio must not be greater than 5000 characters")]
    public string Bio { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]

    public string PasswordHash { get; set; }

    public DateTime MemberSince { get; set; } = DateTime.UtcNow;

    [Required] 
    [MaxLength(UserConstants.MaxRoleLength)]
    public string Role { get; set; } = UserRoles.User;
    public ICollection<ProjectLike> Likes { get; set; } = new List<ProjectLike>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();


}