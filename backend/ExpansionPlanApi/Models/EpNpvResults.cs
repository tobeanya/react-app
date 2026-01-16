using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_npv_results")]
public class EpNpvResults
{
    [Key]
    [Column("study_id")]
    public int? StudyId { get; set; }

    [Column("iteration")]
    public int? Iteration { get; set; }

    [Column("year")]
    [StringLength(50)]
    public string? Year { get; set; }

    [Column("reliability_metric")]
    public double? ReliabilityMetric { get; set; }

    [Column("system_cost")]
    public double? SystemCost { get; set; }

    [Column("stage")]
    [StringLength(50)]
    public string? Stage { get; set; }

    [Column("npv_system_cost")]
    public double? NpvSystemCost { get; set; }

    [Column("simulating_year")]
    public int? SimulatingYear { get; set; }

    [Column("npv_reliability_metric")]
    public double? NpvReliabilityMetric { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("production_cost")]
    public double? ProductionCost { get; set; }

    [Column("fuel_cost")]
    public double? FuelCost { get; set; }

    [Column("startup_cost")]
    public double? StartupCost { get; set; }

    [Column("variable_om_cost")]
    public double? VariableOmCost { get; set; }

    [Column("emission_cost")]
    public double? EmissionCost { get; set; }

    [Column("npv_production_cost")]
    public double? NpvProductionCost { get; set; }

    [Column("npv_fuel_cost")]
    public double? NpvFuelCost { get; set; }

    [Column("npv_startup_cost")]
    public double? NpvStartupCost { get; set; }

    [Column("npv_variable_om_cost")]
    public double? NpvVariableOmCost { get; set; }

    [Column("npv_emission_cost")]
    public double? NpvEmissionCost { get; set; }

    [Column("energy_margin")]
    public double? EnergyMargin { get; set; }

    [Column("npv_energy_margin")]
    public double? NpvEnergyMargin { get; set; }

    [Column("npv_eue_cost")]
    public double? NpvEueCost { get; set; }

    [Column("eue_cost")]
    public double? EueCost { get; set; }

    [Column("npv_net_purchase_cost")]
    public double? NpvNetPurchaseCost { get; set; }

    [Column("npv_system_fixed_om_cost")]
    public double? NpvSystemFixedOmCost { get; set; }

    [Column("npv_system_fixed_cost")]
    public double? NpvSystemFixedCost { get; set; }

    [Column("npv_system_fixed_carrying_cost")]
    public double? NpvSystemFixedCarryingCost { get; set; }

    [Column("net_purchase_cost")]
    public double? NetPurchaseCost { get; set; }

    [Column("system_fixed_cost")]
    public double? SystemFixedCost { get; set; }

    [Column("system_fixed_carrying_cost")]
    public double? SystemFixedCarryingCost { get; set; }

    [Column("system_fixed_om_cost")]
    public double? SystemFixedOmCost { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }

    [ForeignKey("StudyId")]
    public virtual EpStudyMaster? Study { get; set; }
}
