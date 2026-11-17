using EnthCollab.Api.Dtos;
using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EnthCollab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TagsController : ControllerBase
{
    private readonly EnthCollabDbContext _context;

    public TagsController(EnthCollabDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
    {
        return await _context.Tags.ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Tag>> GetTag(int id)
    {
        var tag = await _context.Tags.FindAsync(id);

        if (tag == null)
        {
            return NotFound();
        }

        return Ok(tag);
    }
}