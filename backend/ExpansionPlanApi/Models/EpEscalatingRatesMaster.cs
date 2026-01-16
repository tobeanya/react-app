using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_escalating_rates_master")]
public class EpEscalatingRatesMaster
{
    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("escalating_variable")]
    [StringLength(255)]
    public string? EscalatingVariable { get; set; }

    [Column("unit_var_id")]
    public int? UnitVarId { get; set; }

    [Column("display_name")]
    [StringLength(255)]
    public string? DisplayName { get; set; }

    [Column("start_year")]
    [StringLength(4)]
    public string? StartYear { get; set; }

    [Column("end_year")]
    [StringLength(4)]
    public string? EndYear { get; set; }

    [Column("rate")]
    public double? Rate { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
