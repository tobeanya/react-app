using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Services;

namespace ExpansionPlanApi.Data;

public interface IDynamicDbContextFactory
{
    ExpansionPlanDbContext CreateDbContext();
    void UpdateConnectionString(string connectionString);
    bool HasValidConnection { get; }
}

public class DynamicDbContextFactory : IDynamicDbContextFactory
{
    private readonly IConnectionStringService _connectionStringService;
    private readonly ILogger<DynamicDbContextFactory> _logger;
    private string? _overrideConnectionString;

    public DynamicDbContextFactory(
        IConnectionStringService connectionStringService,
        ILogger<DynamicDbContextFactory> logger)
    {
        _connectionStringService = connectionStringService;
        _logger = logger;
    }

    public bool HasValidConnection =>
        !string.IsNullOrEmpty(_overrideConnectionString) ||
        !string.IsNullOrEmpty(_connectionStringService.GetCurrentConnectionString());

    public ExpansionPlanDbContext CreateDbContext()
    {
        var connectionString = _overrideConnectionString
            ?? _connectionStringService.GetCurrentConnectionString();

        if (string.IsNullOrEmpty(connectionString))
        {
            _logger.LogWarning("No database connection string configured");
            throw new InvalidOperationException(
                "No database connection configured. Please configure a database connection first.");
        }

        var optionsBuilder = new DbContextOptionsBuilder<ExpansionPlanDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new ExpansionPlanDbContext(optionsBuilder.Options);
    }

    public void UpdateConnectionString(string connectionString)
    {
        _overrideConnectionString = connectionString;
        _logger.LogInformation("Database connection string updated dynamically");
    }
}
