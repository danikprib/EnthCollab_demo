using EnthCollab.Data;
using EnthCollab.Data.Entities;
using Microsoft.AspNetCore.Mvc;

namespace EnthCollab.Api.Controllers;


[Route("api/[controller]")]
[ApiController]
public class ProjectsController : ControllerBase
{
    private readonly EnthCollabDbContext _context;
    //public IActionResult Index()
    //{
    //    return View();
    //}

    public ProjectsController(EnthCollabDbContext context)
    {
        _context = context;
    }

    // GET: api/projects
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProducts()
    {
        return await _context.Projects.ToListAsync();
    }

    [HttpGet]
    public IActionResult GetProjects()
    {
        return null;
    }

    public
}
