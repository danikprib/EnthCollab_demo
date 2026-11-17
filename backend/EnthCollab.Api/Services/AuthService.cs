using EnthCollab.Api.Dtos;
using EnthCollab.Api.Exceptions;
using EnthCollab.Data;
using EnthCollab.Data.Constants;
using EnthCollab.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<AuthResponseDto> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}

public class AuthService(EnthCollabDbContext db, ITokenService tokens, ILogger<AuthService> logger) : IAuthService
{
    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (await db.Users.AnyAsync(u => u.Email == dto.Email)) throw new ConflictException("Email already registered.");
        if (await db.Users.AnyAsync(u => u.Username == dto.Username)) throw new ConflictException("Username already taken.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, AuthConstants.BcryptWorkFactor)
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        logger.LogInformation("User {UserId} registered", user.Id);
        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == dto.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            logger.LogWarning("Failed login attempt");
            throw new UnauthorizedException("Invalid email or password.");
        }
        logger.LogInformation("User {UserId} logged in", user.Id);
        return await IssueTokensAsync(user);
    }

    public async Task<AuthResponseDto> RefreshAsync(string refreshToken)
    {
        var hash = tokens.Hash(refreshToken);
        var stored = await db.RefreshTokens.Include(r => r.User).SingleOrDefaultAsync(r => r.TokenHash == hash);
        if (stored is null || !stored.IsActive) throw new UnauthorizedException("Invalid refresh token.");

        stored.RevokedAt = DateTime.UtcNow;
        return await IssueTokensAsync(stored.User);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var hash = tokens.Hash(refreshToken);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(r => r.TokenHash == hash);
        if (stored is { RevokedAt: null })
        {
            stored.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    private async Task<AuthResponseDto> IssueTokensAsync(User user)
    {
        var raw = tokens.GenerateRefreshToken();
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokens.Hash(raw),
            ExpiresAt = DateTime.UtcNow.AddDays(AuthConstants.RefreshTokenDays)
        });
        await db.SaveChangesAsync();
        return new AuthResponseDto
        {
            Token = tokens.CreateAccessToken(user),
            RefreshToken = raw,
            UserId = user.Id,
            Username = user.Username,
            Role = user.Role
        };
    }
}