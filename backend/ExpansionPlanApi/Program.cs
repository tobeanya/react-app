using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Data;
using ExpansionPlanApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Expansion Plan API", Version = "v1" });
});

// Configure database connection services (singleton for connection management)
builder.Services.AddSingleton<IConnectionStringService, ConnectionStringService>();
builder.Services.AddSingleton<IDynamicDbContextFactory, DynamicDbContextFactory>();

// Configure Entity Framework with dynamic connection string support
builder.Services.AddScoped<ExpansionPlanDbContext>(provider =>
{
    var factory = provider.GetRequiredService<IDynamicDbContextFactory>();
    return factory.CreateDbContext();
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? new[] { "http://localhost:8081" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Expansion Plan API v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { Status = "Healthy", Timestamp = DateTime.UtcNow });

app.Run();
