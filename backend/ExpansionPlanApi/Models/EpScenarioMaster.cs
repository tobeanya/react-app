using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_scenario_master")]
public class EpScenarioMaster
{
    [Key]
    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("ep_scenario_description")]
    [StringLength(500)]
    public string? EpScenarioDescription { get; set; }

    // Navigation properties
    public virtual ICollection<EpStudyMaster> Studies { get; set; } = new List<EpStudyMaster>();
    public virtual ICollection<EpUnitMaster> Units { get; set; } = new List<EpUnitMaster>();
    public virtual ICollection<EpSolverDefinition> SolverDefinitions { get; set; } = new List<EpSolverDefinition>();
    public virtual ICollection<EpMetricMaster> Metrics { get; set; } = new List<EpMetricMaster>();
    public virtual ICollection<EpEscalatingRatesMaster> EscalatingRates { get; set; } = new List<EpEscalatingRatesMaster>();
    public virtual ICollection<EpStudyResults> StudyResults { get; set; } = new List<EpStudyResults>();
    public virtual ICollection<EpNpvResults> NpvResults { get; set; } = new List<EpNpvResults>();
}
