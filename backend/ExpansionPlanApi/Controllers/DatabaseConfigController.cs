using Microsoft.AspNetCore.Mvc;
using ExpansionPlanApi.Models;
using ExpansionPlanApi.Services;
using ExpansionPlanApi.Data;

namespace ExpansionPlanApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseConfigController : ControllerBase
{
    private readonly IConnectionStringService _connectionService;
    private readonly IDynamicDbContextFactory _dbContextFactory;
    private readonly ILogger<DatabaseConfigController> _logger;

    public DatabaseConfigController(
        IConnectionStringService connectionService,
        IDynamicDbContextFactory dbContextFactory,
        ILogger<DatabaseConfigController> logger)
    {
        _connectionService = connectionService;
        _dbContextFactory = dbContextFactory;
        _logger = logger;
    }

    /// <summary>
    /// Get current database connection settings (without password)
    /// </summary>
    [HttpGet("current")]
    public ActionResult<DatabaseConnectionResponse> GetCurrentSettings()
    {
        var settings = _connectionService.GetCurrentSettings();
        if (settings == null)
        {
            return Ok(new DatabaseConnectionResponse
            {
                Success = false,
                Message = "No database connection configured",
                IsConnected = false
            });
        }
        return Ok(settings);
    }

    /// <summary>
    /// Test a database connection without saving
    /// </summary>
    [HttpPost("test")]
    public async Task<ActionResult<ConnectionTestResult>> TestConnection(
        [FromBody] DatabaseConnectionRequest request)
    {
        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.ServerName))
        {
            return BadRequest(new ConnectionTestResult
            {
                Success = false,
                Message = "Server name is required"
            });
        }

        if (string.IsNullOrWhiteSpace(request.DatabaseName))
        {
            return BadRequest(new ConnectionTestResult
            {
                Success = false,
                Message = "Database name is required"
            });
        }

        if (request.AuthenticationType == "SqlServer")
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new ConnectionTestResult
                {
                    Success = false,
                    Message = "Username is required for SQL Server authentication"
                });
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new ConnectionTestResult
                {
                    Success = false,
                    Message = "Password is required for SQL Server authentication"
                });
            }
        }

        var connectionString = _connectionService.BuildConnectionString(request);
        var result = await _connectionService.TestConnectionAsync(connectionString);

        return Ok(result);
    }

    /// <summary>
    /// Configure and save database connection (tests first)
    /// </summary>
    [HttpPost("configure")]
    public async Task<ActionResult<DatabaseConnectionResponse>> ConfigureConnection(
        [FromBody] DatabaseConnectionRequest request)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.ServerName))
            {
                return BadRequest(new DatabaseConnectionResponse
                {
                    Success = false,
                    Message = "Server name is required",
                    IsConnected = false
                });
            }

            if (string.IsNullOrWhiteSpace(request.DatabaseName))
            {
                return BadRequest(new DatabaseConnectionResponse
                {
                    Success = false,
                    Message = "Database name is required",
                    IsConnected = false
                });
            }

            if (request.AuthenticationType == "SqlServer")
            {
                if (string.IsNullOrWhiteSpace(request.Username))
                {
                    return BadRequest(new DatabaseConnectionResponse
                    {
                        Success = false,
                        Message = "Username is required for SQL Server authentication",
                        IsConnected = false
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new DatabaseConnectionResponse
                    {
                        Success = false,
                        Message = "Password is required for SQL Server authentication",
                        IsConnected = false
                    });
                }
            }

            // Build and test connection
            var connectionString = _connectionService.BuildConnectionString(request);
            var testResult = await _connectionService.TestConnectionAsync(connectionString);

            if (!testResult.Success)
            {
                return BadRequest(new DatabaseConnectionResponse
                {
                    Success = false,
                    Message = testResult.Message,
                    IsConnected = false
                });
            }

            // Save settings and update factory
            await _connectionService.SaveConnectionSettingsAsync(request);
            _dbContextFactory.UpdateConnectionString(connectionString);

            _logger.LogInformation(
                "Database connection configured: {Server}/{Database} using {AuthType}",
                request.ServerName, request.DatabaseName, request.AuthenticationType);

            return Ok(new DatabaseConnectionResponse
            {
                Success = true,
                Message = $"Connected successfully to SQL Server {testResult.SqlServerVersion}",
                ServerName = request.ServerName,
                DatabaseName = request.DatabaseName,
                AuthenticationType = request.AuthenticationType,
                Username = request.AuthenticationType == "SqlServer" ? request.Username : null,
                IsConnected = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error configuring database connection");
            return StatusCode(500, new DatabaseConnectionResponse
            {
                Success = false,
                Message = "An error occurred configuring the connection",
                IsConnected = false
            });
        }
    }

    /// <summary>
    /// Disconnect and clear current connection settings
    /// </summary>
    [HttpPost("disconnect")]
    public ActionResult Disconnect()
    {
        // Note: In a full implementation, you might want to clear the saved settings
        // For now, we just acknowledge the disconnect request
        _logger.LogInformation("Database disconnect requested");

        return Ok(new { message = "Disconnected", success = true });
    }

    /// <summary>
    /// Check if a database connection is currently configured
    /// </summary>
    [HttpGet("status")]
    public ActionResult GetConnectionStatus()
    {
        var hasConnection = _dbContextFactory.HasValidConnection;
        var settings = _connectionService.GetCurrentSettings();

        return Ok(new
        {
            IsConnected = hasConnection,
            ServerName = settings?.ServerName,
            DatabaseName = settings?.DatabaseName,
            AuthenticationType = settings?.AuthenticationType
        });
    }
}
