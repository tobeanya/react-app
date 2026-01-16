using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_master")]
public class EpMaster
{
    [Key]
    [Column("solver_var_id")]
    public int? SolverVarId { get; set; }

    [Column("solver_var_name")]
    [StringLength(150)]
    public string? SolverVarName { get; set; }

    [Column("solver_var_description")]
    public string? SolverVarDescription { get; set; }

    // Navigation properties
    public virtual ICollection<EpSolverDefinition> SolverDefinitions { get; set; } = new List<EpSolverDefinition>();
}
