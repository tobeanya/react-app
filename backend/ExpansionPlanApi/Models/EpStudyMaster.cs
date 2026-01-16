using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_study_master")]
public class EpStudyMaster
{
    [Key]
    [Column("study_id")]
    public int? StudyId { get; set; }

    [Column("status")]
    [StringLength(150)]
    public string? Status { get; set; }

    [Column("year")]
    [StringLength(50)]
    public string? Year { get; set; }

    [Column("marginal_unit")]
    [StringLength(500)]
    public string? MarginalUnit { get; set; }

    [Column("ep_scenario_id")]
    public int? EpScenarioId { get; set; }

    [Column("unit_type")]
    [StringLength(50)]
    public string? UnitType { get; set; }

    [Column("unit_category_description")]
    [StringLength(100)]
    public string? UnitCategoryDescription { get; set; }

    [Column("end_year")]
    [StringLength(50)]
    public string? EndYear { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }

    public virtual ICollection<EpStudyResults> StudyResults { get; set; } = new List<EpStudyResults>();
    public virtual ICollection<EpNpvResults> NpvResults { get; set; } = new List<EpNpvResults>();
}
