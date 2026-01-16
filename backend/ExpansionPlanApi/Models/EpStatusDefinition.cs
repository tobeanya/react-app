using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_status_definition")]
public class EpStatusDefinition
{
    [Column("solver_status_id")]
    public int? SolverStatusId { get; set; }

    [Column("status")]
    public string? Status { get; set; }

    [Column("status_time")]
    public DateTime? StatusTime { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    // Navigation properties
    [ForeignKey("SolverStatusId")]
    public virtual EpStatusMaster? StatusMaster { get; set; }

    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
