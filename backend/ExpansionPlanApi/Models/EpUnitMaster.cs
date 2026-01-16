using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_unit_master")]
public class EpUnitMaster
{
    [Key]
    [Column("ep_unit_id")]
    public int? EpUnitId { get; set; }

    [Column("year")]
    [StringLength(50)]
    public string? Year { get; set; }

    [Column("max_number_of_build")]
    public int? MaxNumberOfBuild { get; set; }

    [Column("current_number_of_build")]
    public int? CurrentNumberOfBuild { get; set; }

    [Column("ep_unit_description")]
    [StringLength(500)]
    public string? EpUnitDescription { get; set; }

    [Column("lifetime")]
    public int? Lifetime { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("exclusive_of_units")]
    [StringLength(500)]
    public string? ExclusiveOfUnits { get; set; }

    [Column("exclude_build")]
    public bool? ExcludeBuild { get; set; }

    [Column("max_number_of_build_per_year")]
    public int? MaxNumberOfBuildPerYear { get; set; }

    [Column("current_number_of_build_per_year")]
    public int? CurrentNumberOfBuildPerYear { get; set; }

    [Column("temporary_elimination")]
    public bool? TemporaryElimination { get; set; }

    [Column("total_rank")]
    public int? TotalRank { get; set; }

    [Column("end_year")]
    [StringLength(50)]
    public string? EndYear { get; set; }

    [Column("is_retirement_candidate")]
    public bool? IsRetirementCandidate { get; set; }

    [Column("permanent_elimination")]
    public bool? PermanentElimination { get; set; }

    [Column("start_month")]
    public int? StartMonth { get; set; }

    [Column("capacity")]
    public double? Capacity { get; set; }

    [Column("total_fixed_costs")]
    public double? TotalFixedCosts { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }

    public virtual ICollection<EpUnitResults> UnitResults { get; set; } = new List<EpUnitResults>();
}
