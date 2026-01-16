using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_solver_definition")]
public class EpSolverDefinition
{
    [Column("solver_var_id")]
    public int? SolverVarId { get; set; }

    [Column("solver_value")]
    public string? SolverValue { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    // Navigation properties
    [ForeignKey("SolverVarId")]
    public virtual EpMaster? SolverVariable { get; set; }

    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
