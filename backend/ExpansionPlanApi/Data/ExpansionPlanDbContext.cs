using Microsoft.EntityFrameworkCore;
using ExpansionPlanApi.Models;

namespace ExpansionPlanApi.Data;

public class ExpansionPlanDbContext : DbContext
{
    public ExpansionPlanDbContext(DbContextOptions<ExpansionPlanDbContext> options)
        : base(options)
    {
    }

    // Core tables
    public DbSet<EpScenarioMaster> Scenarios { get; set; }
    public DbSet<EpStudyMaster> Studies { get; set; }
    public DbSet<EpStudyResults> StudyResults { get; set; }
    public DbSet<EpNpvResults> NpvResults { get; set; }
    public DbSet<EpUnitMaster> Units { get; set; }
    public DbSet<EpUnitResults> UnitResults { get; set; }

    // Configuration tables
    public DbSet<EpMaster> SolverVariables { get; set; }
    public DbSet<EpSolverDefinition> SolverDefinitions { get; set; }
    public DbSet<EpMetricMaster> Metrics { get; set; }
    public DbSet<EpEscalatingRatesMaster> EscalatingRates { get; set; }

    // Status tables
    public DbSet<EpStatusMaster> StatusMasters { get; set; }
    public DbSet<EpStatusDefinition> StatusDefinitions { get; set; }

    // Transmission tables
    public DbSet<EpTransmissionMaster> TransmissionMasters { get; set; }

    // Unit definition/adjustment tables
    public DbSet<EpUnitDefinition> UnitDefinitions { get; set; }
    public DbSet<EpUnitAdjustment> UnitAdjustments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite keys for tables without a single primary key
        modelBuilder.Entity<EpSolverDefinition>()
            .HasNoKey();

        modelBuilder.Entity<EpEscalatingRatesMaster>()
            .HasNoKey();

        modelBuilder.Entity<EpStatusDefinition>()
            .HasNoKey();

        modelBuilder.Entity<EpUnitDefinition>()
            .HasNoKey();

        modelBuilder.Entity<EpUnitAdjustment>()
            .HasNoKey();

        modelBuilder.Entity<EpUnitResults>()
            .HasNoKey();

        // Configure EpStudyResults - may have composite key based on study_id + iteration + year
        modelBuilder.Entity<EpStudyResults>()
            .HasNoKey();

        // Configure EpNpvResults - may have composite key
        modelBuilder.Entity<EpNpvResults>()
            .HasNoKey();

        // Disable cascading deletes to avoid cycles
        foreach (var relationship in modelBuilder.Model.GetEntityTypes()
            .SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }
}
