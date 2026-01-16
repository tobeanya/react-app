using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_unit_definition")]
public class EpUnitDefinition
{
    [Column("ep_unit_id")]
    public int? EpUnitId { get; set; }

    [Column("unit_id")]
    public int? UnitId { get; set; }

    [Column("study_id")]
    public int? StudyId { get; set; }

    [Column("priority")]
    public int? Priority { get; set; }

    [Column("marginal_unit")]
    public bool? MarginalUnit { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    // Navigation properties
    [ForeignKey("EpUnitId")]
    public virtual EpUnitMaster? Unit { get; set; }

    [ForeignKey("StudyId")]
    public virtual EpStudyMaster? Study { get; set; }

    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
