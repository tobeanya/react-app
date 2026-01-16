using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Data;
using ExpansionPlanApi.Models;

namespace ExpansionPlanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitsController : ControllerBase
{
    private readonly ExpansionPlanDbContext _context;
    private readonly ILogger<UnitsController> _logger;

    public UnitsController(ExpansionPlanDbContext context, ILogger<UnitsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all candidate units for a scenario
    /// </summary>
    [HttpGet("scenario/{scenarioId}")]
    public async Task<ActionResult<IEnumerable<EpUnitMaster>>> GetUnits(int scenarioId)
    {
        try
        {
            var units = await _context.Units
                .Where(u => u.EpScenarioId == scenarioId)
                .OrderBy(u => u.EpUnitDescription)
                .ToListAsync();

            return Ok(units);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching units for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching units");
        }
    }

    /// <summary>
    /// Get a specific unit by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EpUnitMaster>> GetUnit(int id)
    {
        try
        {
            var unit = await _context.Units
                .FirstOrDefaultAsync(u => u.EpUnitId == id);

            if (unit == null)
            {
                return NotFound($"Unit with ID {id} not found");
            }

            return Ok(unit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching unit {Id}", id);
            return StatusCode(500, "Error fetching unit");
        }
    }

    /// <summary>
    /// Get retirement candidates for a scenario
    /// </summary>
    [HttpGet("scenario/{scenarioId}/retirements")]
    public async Task<ActionResult<IEnumerable<EpUnitMaster>>> GetRetirementCandidates(int scenarioId)
    {
        try
        {
            var units = await _context.Units
                .Where(u => u.EpScenarioId == scenarioId && u.IsRetirementCandidate == true)
                .OrderBy(u => u.EpUnitDescription)
                .ToListAsync();

            return Ok(units);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching retirement candidates for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching retirement candidates");
        }
    }

    /// <summary>
    /// Get unit results (capacity additions/removals over time)
    /// </summary>
    [HttpGet("{id}/results")]
    public async Task<ActionResult<IEnumerable<EpUnitResults>>> GetUnitResults(int id)
    {
        try
        {
            var results = await _context.UnitResults
                .Where(r => r.EpUnitId == id)
                .OrderBy(r => r.Year)
                .ThenBy(r => r.Iteration)
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching results for unit {Id}", id);
            return StatusCode(500, "Error fetching unit results");
        }
    }
}
