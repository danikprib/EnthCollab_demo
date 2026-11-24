using System.Net;
using System.Security.Claims;
using EnthCollab.Api.Dtos;
using EnthCollab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AgentController(IAgentService agentService) : ControllerBase
{
    [HttpGet("current")]
    public async Task<ActionResult<List<AgentMessageDto>>> GetCurrent(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var messages = await agentService.GetCurrentConversationAsync(userId, ct);
        return Ok(messages);
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AgentStructuredReplyDto>> Chat(
        [FromBody] AgentChatRequestDto request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Message cannot be empty or whitespace." });

        var userId = GetCurrentUserId();

        try
        {
            var reply = await agentService.ChatAsync(userId, request, ct);
            return Ok(reply);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.TooManyRequests)
        {
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { message = "Gemini rate limit reached. Please wait a moment and try again." });
        }
    }

    [HttpDelete("current")]
    public async Task<IActionResult> ClearCurrent(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        await agentService.ClearCurrentConversationAsync(userId, ct);
        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var rawId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub");

        if (!int.TryParse(rawId, out var userId))
            throw new UnauthorizedAccessException("Invalid or missing user identifier in token.");

        return userId;
    }
}   