using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_status_master")]
public class EpStatusMaster
{
    [Key]
    [Column("solver_status_id")]
    public int? SolverStatusId { get; set; }

    [Column("solver_status_name")]
    [StringLength(50)]
    public string? SolverStatusName { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
