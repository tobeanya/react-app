using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_metric_master")]
public class EpMetricMaster
{
    [Key]
    [Column("constraint_id")]
    public int? ConstraintId { get; set; }

    [Column("constraint_variable")]
    [StringLength(255)]
    public string? ConstraintVariable { get; set; }

    [Column("exceedance_value")]
    public double? ExceedanceValue { get; set; }

    [Column("stage_1_Value")]
    public double? Stage1Value { get; set; }

    [Column("priority")]
    public int? Priority { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("stage_2_Value")]
    public double? Stage2Value { get; set; }

    [Column("stage_3_Value")]
    public double? Stage3Value { get; set; }

    [Column("year")]
    [StringLength(4)]
    public string? Year { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
