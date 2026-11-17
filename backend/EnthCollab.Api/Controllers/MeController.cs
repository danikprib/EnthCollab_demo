using EnthCollab.Api.Dtos;
using EnthCollab.Api.Extensions;
using EnthCollab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnthCollab.Api.Controllers;

[ApiController] 
[Authorize] 
[Route("api/me")]
public class MeController(ILikeService likes) : ControllerBase
{
    [HttpGet("likes")]
    public async Task<ActionResult<List<ProjectSummaryDto>>> GetLikes() => Ok(await likes.GetLikedProjectsAsync(User.GetUserId()));
}