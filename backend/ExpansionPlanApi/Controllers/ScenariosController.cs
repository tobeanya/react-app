using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Data;
using ExpansionPlanApi.Models;

namespace ExpansionPlanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScenariosController : ControllerBase
{
    private readonly ExpansionPlanDbContext _context;
    private readonly ILogger<ScenariosController> _logger;

    public ScenariosController(ExpansionPlanDbContext context, ILogger<ScenariosController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all expansion plan scenarios
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EpScenarioMaster>>> GetScenarios()
    {
        try
        {
            var scenarios = await _context.Scenarios
                .OrderBy(s => s.EpScenarioDescription)
                .ToListAsync();
            return Ok(scenarios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching scenarios");
            return StatusCode(500, "Error fetching scenarios");
        }
    }

    /// <summary>
    /// Get a specific scenario by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<EpScenarioMaster>> GetScenario(int id)
    {
        try
        {
            var scenario = await _context.Scenarios
                .FirstOrDefaultAsync(s => s.EpScenarioId == id);

            if (scenario == null)
            {
                return NotFound($"Scenario with ID {id} not found");
            }

            return Ok(scenario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching scenario {Id}", id);
            return StatusCode(500, "Error fetching scenario");
        }
    }

    /// <summary>
    /// Get scenario with all related data (units, solver settings, etc.)
    /// </summary>
    [HttpGet("{id}/details")]
    public async Task<ActionResult<object>> GetScenarioDetails(int id)
    {
        try
        {
            var scenario = await _context.Scenarios
                .FirstOrDefaultAsync(s => s.EpScenarioId == id);

            if (scenario == null)
            {
                return NotFound($"Scenario with ID {id} not found");
            }

            // Get related data
            var units = await _context.Units
                .Where(u => u.EpScenarioId == id)
                .OrderBy(u => u.EpUnitDescription)
                .ToListAsync();

            var metrics = await _context.Metrics
                .Where(m => m.EpScenarioId == id)
                .OrderBy(m => m.Priority)
                .ToListAsync();

            var escalatingRates = await _context.EscalatingRates
                .Where(e => e.EpScenarioId == id)
                .OrderBy(e => e.DisplayName)
                .ToListAsync();

            var solverDefinitions = await _context.SolverDefinitions
                .Where(s => s.EpScenarioId == id)
                .ToListAsync();

            var studies = await _context.Studies
                .Where(s => s.EpScenarioId == id)
                .OrderBy(s => s.Year)
                .ToListAsync();

            return Ok(new
            {
                Scenario = scenario,
                Units = units,
                Metrics = metrics,
                EscalatingRates = escalatingRates,
                SolverDefinitions = solverDefinitions,
                Studies = studies
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching scenario details for {Id}", id);
            return StatusCode(500, "Error fetching scenario details");
        }
    }

    /// <summary>
    /// Get solver settings for a scenario
    /// </summary>
    [HttpGet("{id}/solver-settings")]
    public async Task<ActionResult<IEnumerable<object>>> GetSolverSettings(int id)
    {
        try
        {
            var settings = await _context.SolverDefinitions
                .Where(s => s.EpScenarioId == id)
                .Join(_context.SolverVariables,
                    def => def.SolverVarId,
                    master => master.SolverVarId,
                    (def, master) => new
                    {
                        SolverVarId = def.SolverVarId,
                        SolverVarName = master.SolverVarName,
                        SolverVarDescription = master.SolverVarDescription,
                        SolverValue = def.SolverValue
                    })
                .ToListAsync();

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching solver settings for scenario {Id}", id);
            return StatusCode(500, "Error fetching solver settings");
        }
    }

    /// <summary>
    /// Create a new expansion plan scenario
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EpScenarioMaster>> CreateScenario([FromBody] CreateScenarioRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Scenario name is required");
            }

            var scenario = new EpScenarioMaster
            {
                EpScenarioDescription = request.Name
            };

            _context.Scenarios.Add(scenario);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new scenario with ID {Id}", scenario.EpScenarioId);

            return CreatedAtAction(nameof(GetScenario), new { id = scenario.EpScenarioId }, scenario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating scenario");
            return StatusCode(500, "Error creating scenario");
        }
    }

    /// <summary>
    /// Update an existing scenario
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<EpScenarioMaster>> UpdateScenario(int id, [FromBody] UpdateScenarioRequest request)
    {
        try
        {
            var scenario = await _context.Scenarios
                .FirstOrDefaultAsync(s => s.EpScenarioId == id);

            if (scenario == null)
            {
                return NotFound($"Scenario with ID {id} not found");
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                scenario.EpScenarioDescription = request.Name;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated scenario {Id}", id);

            return Ok(scenario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating scenario {Id}", id);
            return StatusCode(500, "Error updating scenario");
        }
    }

    /// <summary>
    /// Delete a scenario
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteScenario(int id)
    {
        try
        {
            var scenario = await _context.Scenarios
                .FirstOrDefaultAsync(s => s.EpScenarioId == id);

            if (scenario == null)
            {
                return NotFound($"Scenario with ID {id} not found");
            }

            _context.Scenarios.Remove(scenario);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted scenario {Id}", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting scenario {Id}", id);
            return StatusCode(500, "Error deleting scenario");
        }
    }
}

/// <summary>
/// Request model for creating a scenario
/// </summary>
public class CreateScenarioRequest
{
    public string? Name { get; set; }
}

/// <summary>
/// Request model for updating a scenario
/// </summary>
public class UpdateScenarioRequest
{
    public string? Name { get; set; }
}
