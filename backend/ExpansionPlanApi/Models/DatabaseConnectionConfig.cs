namespace ExpansionPlanApi.Models;

/// <summary>
/// Request model for configuring database connection
/// </summary>
public class DatabaseConnectionRequest
{
    public string ServerName { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;

    /// <summary>
    /// "Windows" for Windows Authentication, "SqlServer" for SQL Server Authentication
    /// </summary>
    public string AuthenticationType { get; set; } = "Windows";

    /// <summary>
    /// Username for SQL Server Authentication (not used for Windows Auth)
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Password for SQL Server Authentication (not used for Windows Auth)
    /// </summary>
    public string? Password { get; set; }

    public bool TrustServerCertificate { get; set; } = true;
    public int ConnectionTimeout { get; set; } = 30;
}

/// <summary>
/// Response model for connection configuration status
/// </summary>
public class DatabaseConnectionResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? ServerName { get; set; }
    public string? DatabaseName { get; set; }
    public string? AuthenticationType { get; set; }
    public string? Username { get; set; } // Never return password
    public bool IsConnected { get; set; }
}

/// <summary>
/// Result of testing a database connection
/// </summary>
public class ConnectionTestResult
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public string? SqlServerVersion { get; set; }
    public int ResponseTimeMs { get; set; }
}
