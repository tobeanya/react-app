using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_unit_results")]
public class EpUnitResults
{
    [Column("ep_unit_id")]
    public int? EpUnitId { get; set; }

    [Column("year")]
    [StringLength(50)]
    public string? Year { get; set; }

    [Column("capacity_added")]
    public double? CapacityAdded { get; set; }

    [Column("stage")]
    [StringLength(50)]
    public string? Stage { get; set; }

    [Column("iteration")]
    public int? Iteration { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("capacity_removed")]
    public double? CapacityRemoved { get; set; }

    // Navigation properties
    [ForeignKey("EpUnitId")]
    public virtual EpUnitMaster? Unit { get; set; }

    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
