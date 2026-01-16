using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_study_results")]
public class EpStudyResults
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

    [Column("unit_combo")]
    public string? UnitCombo { get; set; }

    [Column("system_cost")]
    public double? SystemCost { get; set; }

    [Column("status")]
    [StringLength(150)]
    public string? Status { get; set; }

    [Column("stage")]
    public string? Stage { get; set; }

    [Column("capacity_added")]
    public double? CapacityAdded { get; set; }

    [Column("generation")]
    public double? Generation { get; set; }

    [Column("start_attempts")]
    public double? StartAttempts { get; set; }

    [Column("capacity_factor")]
    public double? CapacityFactor { get; set; }

    [Column("hours_online")]
    public double? HoursOnline { get; set; }

    [Column("fixed_cost")]
    public double? FixedCost { get; set; }

    [Column("incremental_capital_cost")]
    public double? IncrementalCapitalCost { get; set; }

    [Column("selection_criteria")]
    [StringLength(250)]
    public string? SelectionCriteria { get; set; }

    [Column("production_cost")]
    public double? ProductionCost { get; set; }

    [Column("system_curtailment")]
    public double? SystemCurtailment { get; set; }

    [Column("curtailment")]
    public double? Curtailment { get; set; }

    [Column("emission_cost")]
    public double? EmissionCost { get; set; }

    [Column("npv_system_cost")]
    public double? NpvSystemCost { get; set; }

    [Column("npv_reliability_metric")]
    public double? NpvReliabilityMetric { get; set; }

    [Column("fixed_carrying_cost")]
    public double? FixedCarryingCost { get; set; }

    [Column("fixed_om_cost")]
    public double? FixedOmCost { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("fuel_cost")]
    public double? FuelCost { get; set; }

    [Column("startup_cost")]
    public double? StartupCost { get; set; }

    [Column("variable_om_cost")]
    public double? VariableOmCost { get; set; }

    [Column("delta_reliability_metric")]
    public double? DeltaReliabilityMetric { get; set; }

    [Column("cost_by_reliabilty_metric")]
    public double? CostByReliabilityMetric { get; set; }

    [Column("rps_generation")]
    public double? RpsGeneration { get; set; }

    [Column("eue_benefit")]
    public double? EueBenefit { get; set; }

    [Column("max_eue_duration")]
    public double? MaxEueDuration { get; set; }

    [Column("LOLH_Cap")]
    public double? LolhCap { get; set; }

    [Column("LOLEV")]
    public double? Lolev { get; set; }

    [Column("eue_depth")]
    public double? EueDepth { get; set; }

    [Column("energy_margin")]
    public double? EnergyMargin { get; set; }

    [Column("npv_energy_margin")]
    public double? NpvEnergyMargin { get; set; }

    [Column("npv_available_mw_in_eue_hours")]
    public double? NpvAvailableMwInEueHours { get; set; }

    [Column("available_mw_in_eue_hours")]
    public double? AvailableMwInEueHours { get; set; }

    [Column("npv_fixed_cost")]
    public double? NpvFixedCost { get; set; }

    [Column("net_cost")]
    public double? NetCost { get; set; }

    [Column("prompt_cost_by_reliability_metric")]
    public double? PromptCostByReliabilityMetric { get; set; }

    [Column("eue_cap")]
    public double? EueCap { get; set; }

    [Column("eue_cost")]
    public double? EueCost { get; set; }

    [Column("net_purchase_cost")]
    public double? NetPurchaseCost { get; set; }

    [Column("system_fixed_cost")]
    public double? SystemFixedCost { get; set; }

    [Column("system_fixed_carrying_cost")]
    public double? SystemFixedCarryingCost { get; set; }

    [Column("system_fixed_om_cost")]
    public double? SystemFixedOmCost { get; set; }

    [Column("delta_annual_cost")]
    public double? DeltaAnnualCost { get; set; }

    [Column("market_price")]
    public double? MarketPrice { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }

    [ForeignKey("StudyId")]
    public virtual EpStudyMaster? Study { get; set; }
}
