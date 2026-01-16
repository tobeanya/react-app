using System.Diagnostics;
using System.Text.Json;
using Microsoft.Data.SqlClient;
using ExpansionPlanApi.Models;

namespace ExpansionPlanApi.Services;

public interface IConnectionStringService
{
    string BuildConnectionString(DatabaseConnectionRequest config);
    Task<ConnectionTestResult> TestConnectionAsync(string connectionString);
    Task SaveConnectionSettingsAsync(DatabaseConnectionRequest config);
    DatabaseConnectionResponse? GetCurrentSettings();
    string? GetCurrentConnectionString();
}

public class ConnectionStringService : IConnectionStringService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ConnectionStringService> _logger;
    private readonly string _userSettingsPath;

    private DatabaseConnectionRequest? _currentSettings;
    private string? _currentConnectionString;

    public ConnectionStringService(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<ConnectionStringService> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;

        // Store user settings in a file alongside the app
        _userSettingsPath = Path.Combine(
            AppContext.BaseDirectory,
            "appsettings.User.json");

        // Load any previously saved settings on startup
        LoadSavedSettings();
    }

    public string BuildConnectionString(DatabaseConnectionRequest config)
    {
        var builder = new SqlConnectionStringBuilder
        {
            DataSource = config.ServerName,
            InitialCatalog = config.DatabaseName,
            TrustServerCertificate = config.TrustServerCertificate,
            ConnectTimeout = config.ConnectionTimeout,
            MultipleActiveResultSets = true
        };

        if (config.AuthenticationType == "Windows")
        {
            builder.IntegratedSecurity = true;
        }
        else
        {
            builder.IntegratedSecurity = false;
            builder.UserID = config.Username;
            builder.Password = config.Password;
        }

        return builder.ConnectionString;
    }

    public async Task<ConnectionTestResult> TestConnectionAsync(string connectionString)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            var version = connection.ServerVersion;
            stopwatch.Stop();

            _logger.LogInformation(
                "Database connection test successful. SQL Server version: {Version}",
                version);

            return new ConnectionTestResult
            {
                Success = true,
                Message = "Connection successful",
                SqlServerVersion = version,
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds
            };
        }
        catch (SqlException ex)
        {
            stopwatch.Stop();
            _logger.LogWarning(ex, "Database connection test failed");

            return new ConnectionTestResult
            {
                Success = false,
                Message = GetFriendlyErrorMessage(ex),
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Unexpected error during connection test");

            return new ConnectionTestResult
            {
                Success = false,
                Message = "Unexpected error: " + ex.Message,
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds
            };
        }
    }

    public async Task SaveConnectionSettingsAsync(DatabaseConnectionRequest config)
    {
        // Store settings in memory
        _currentSettings = config;
        _currentConnectionString = BuildConnectionString(config);

        // Save non-sensitive settings to file (password is stored encrypted or not at all)
        var settingsToSave = new
        {
            DatabaseConnection = new
            {
                ServerName = config.ServerName,
                DatabaseName = config.DatabaseName,
                AuthenticationType = config.AuthenticationType,
                Username = config.AuthenticationType == "SqlServer" ? config.Username : null,
                TrustServerCertificate = config.TrustServerCertificate,
                ConnectionTimeout = config.ConnectionTimeout
            }
        };

        var json = JsonSerializer.Serialize(settingsToSave, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        await File.WriteAllTextAsync(_userSettingsPath, json);

        _logger.LogInformation(
            "Database connection settings saved to {Path}",
            _userSettingsPath);
    }

    public DatabaseConnectionResponse? GetCurrentSettings()
    {
        if (_currentSettings == null)
        {
            return null;
        }

        return new DatabaseConnectionResponse
        {
            Success = true,
            ServerName = _currentSettings.ServerName,
            DatabaseName = _currentSettings.DatabaseName,
            AuthenticationType = _currentSettings.AuthenticationType,
            Username = _currentSettings.AuthenticationType == "SqlServer"
                ? _currentSettings.Username
                : null,
            IsConnected = _currentConnectionString != null
        };
    }

    public string? GetCurrentConnectionString()
    {
        // If we have a user-configured connection, use it
        if (!string.IsNullOrEmpty(_currentConnectionString))
        {
            return _currentConnectionString;
        }

        // Otherwise fall back to appsettings.json
        return _configuration.GetConnectionString("ExpansionPlanDb");
    }

    private void LoadSavedSettings()
    {
        try
        {
            if (!File.Exists(_userSettingsPath))
            {
                _logger.LogInformation("No saved database settings found");
                return;
            }

            var json = File.ReadAllText(_userSettingsPath);
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("DatabaseConnection", out var dbConfig))
            {
                _currentSettings = new DatabaseConnectionRequest
                {
                    ServerName = dbConfig.GetProperty("ServerName").GetString() ?? "",
                    DatabaseName = dbConfig.GetProperty("DatabaseName").GetString() ?? "",
                    AuthenticationType = dbConfig.GetProperty("AuthenticationType").GetString() ?? "Windows",
                    Username = dbConfig.TryGetProperty("Username", out var username)
                        ? username.GetString()
                        : null,
                    TrustServerCertificate = dbConfig.TryGetProperty("TrustServerCertificate", out var trust)
                        && trust.GetBoolean(),
                    ConnectionTimeout = dbConfig.TryGetProperty("ConnectionTimeout", out var timeout)
                        ? timeout.GetInt32()
                        : 30
                };

                // Note: Password is not saved, so we can't auto-connect for SQL Server auth
                // User will need to re-enter password after app restart
                if (_currentSettings.AuthenticationType == "Windows")
                {
                    _currentConnectionString = BuildConnectionString(_currentSettings);
                    _logger.LogInformation(
                        "Loaded saved database settings for {Server}/{Database}",
                        _currentSettings.ServerName,
                        _currentSettings.DatabaseName);
                }
                else
                {
                    _logger.LogInformation(
                        "Loaded saved database settings (password required for SQL Auth)");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load saved database settings");
        }
    }

    private static string GetFriendlyErrorMessage(SqlException ex)
    {
        return ex.Number switch
        {
            -1 => "Cannot connect to server. Please check the server name and ensure SQL Server is running.",
            18456 => "Login failed. Please check your username and password.",
            4060 => "Database not found. Please check the database name.",
            53 => "Network error. Cannot reach the SQL Server.",
            _ => $"SQL Error ({ex.Number}): {ex.Message}"
        };
    }
}
