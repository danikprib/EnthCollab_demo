using System.Security.Claims;

namespace EnthCollab.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal u) => int.Parse(u.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public static int? TryGetUserId(this ClaimsPrincipal u) =>
        int.TryParse(u.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
}
