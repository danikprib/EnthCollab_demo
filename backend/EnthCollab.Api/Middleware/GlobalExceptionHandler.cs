using EnthCollab.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EnthCollab.Api.Middleware;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex is AppException app
            ? (app.StatusCode, app.Message)
            : (StatusCodes.Status500InternalServerError, "An unexpected error occurred.");

        if (status >= 500)
        {
            logger.LogError(ex, "Unhandled exception on {Method} {Path}", ctx.Request.Method, ctx.Request.Path);
        }
        else
        {
            logger.LogWarning("Request failed with {Status}: {Message}", status, ex.Message);
        }

        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = title, Instance = ctx.Request.Path }, ct);
        return true;
    }
}