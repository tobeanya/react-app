using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Data;
using ExpansionPlanApi.Models;

namespace ExpansionPlanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResultsController : ControllerBase
{
    private readonly ExpansionPlanDbContext _context;
    private readonly ILogger<ResultsController> _logger;

    public ResultsController(ExpansionPlanDbContext context, ILogger<ResultsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get study results for a scenario
    /// </summary>
    [HttpGet("study/{scenarioId}")]
    public async Task<ActionResult<IEnumerable<EpStudyResults>>> GetStudyResults(
        int scenarioId,
        [FromQuery] string? year = null,
        [FromQuery] int? iteration = null)
    {
        try
        {
            var query = _context.StudyResults
                .Where(r => r.EpScenarioId == scenarioId);

            if (!string.IsNullOrEmpty(year))
            {
                query = query.Where(r => r.Year == year);
            }

            if (iteration.HasValue)
            {
                query = query.Where(r => r.Iteration == iteration.Value);
            }

            var results = await query
                .OrderBy(r => r.Year)
                .ThenBy(r => r.Iteration)
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching study results for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching study results");
        }
    }

    /// <summary>
    /// Get NPV results for a scenario
    /// </summary>
    [HttpGet("npv/{scenarioId}")]
    public async Task<ActionResult<IEnumerable<EpNpvResults>>> GetNpvResults(
        int scenarioId,
        [FromQuery] string? year = null,
        [FromQuery] int? iteration = null)
    {
        try
        {
            var query = _context.NpvResults
                .Where(r => r.EpScenarioId == scenarioId);

            if (!string.IsNullOrEmpty(year))
            {
                query = query.Where(r => r.Year == year);
            }

            if (iteration.HasValue)
            {
                query = query.Where(r => r.Iteration == iteration.Value);
            }

            var results = await query
                .OrderBy(r => r.Year)
                .ThenBy(r => r.Iteration)
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching NPV results for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching NPV results");
        }
    }

    /// <summary>
    /// Get unit results for a scenario
    /// </summary>
    [HttpGet("units/{scenarioId}")]
    public async Task<ActionResult<IEnumerable<EpUnitResults>>> GetUnitResults(
        int scenarioId,
        [FromQuery] string? year = null)
    {
        try
        {
            var query = _context.UnitResults
                .Where(r => r.EpScenarioId == scenarioId);

            if (!string.IsNullOrEmpty(year))
            {
                query = query.Where(r => r.Year == year);
            }

            var results = await query
                .OrderBy(r => r.Year)
                .ThenBy(r => r.EpUnitId)
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching unit results for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching unit results");
        }
    }

    /// <summary>
    /// Get available years for a scenario (from study results)
    /// </summary>
    [HttpGet("years/{scenarioId}")]
    public async Task<ActionResult<IEnumerable<string>>> GetAvailableYears(int scenarioId)
    {
        try
        {
            var years = await _context.StudyResults
                .Where(r => r.EpScenarioId == scenarioId && r.Year != null)
                .Select(r => r.Year!)
                .Distinct()
                .OrderBy(y => y)
                .ToListAsync();

            return Ok(years);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching years for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching available years");
        }
    }

    /// <summary>
    /// Get study results summary (aggregated metrics per year)
    /// </summary>
    [HttpGet("study/{scenarioId}/summary")]
    public async Task<ActionResult<object>> GetStudyResultsSummary(int scenarioId)
    {
        try
        {
            var results = await _context.StudyResults
                .Where(r => r.EpScenarioId == scenarioId)
                .GroupBy(r => r.Year)
                .Select(g => new
                {
                    Year = g.Key,
                    TotalCapacityAdded = g.Sum(r => r.CapacityAdded ?? 0),
                    AvgReliabilityMetric = g.Average(r => r.ReliabilityMetric ?? 0),
                    TotalSystemCost = g.Sum(r => r.SystemCost ?? 0),
                    IterationCount = g.Select(r => r.Iteration).Distinct().Count()
                })
                .OrderBy(x => x.Year)
                .ToListAsync();

            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching study results summary for scenario {Id}", scenarioId);
            return StatusCode(500, "Error fetching study results summary");
        }
    }
}
