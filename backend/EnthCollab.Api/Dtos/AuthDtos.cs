using EnthCollab.Data.Constants;
using System.ComponentModel.DataAnnotations;

namespace EnthCollab.Api.Dtos;

public class RegisterDto
{
    [Required]
    [MinLength(UserConstants.MinUsernameLength, ErrorMessage = "Username must be at least 5 characters long")]
    [MaxLength(UserConstants.MaxUsernameLength, ErrorMessage = "Username must NOT be greater than 50 characters")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(PasswordConstants.MinPasswordLength)]
    [MaxLength(PasswordConstants.MaxPasswordLength)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class RefreshRequestDto 
{ 
    [Required] 
    public string RefreshToken { get; set; } = string.Empty; 
}