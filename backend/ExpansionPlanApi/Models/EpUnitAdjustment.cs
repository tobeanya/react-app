using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_unit_adjustment")]
public class EpUnitAdjustment
{
    [Column("study_id")]
    public int? StudyId { get; set; }

    [Column("unit_id")]
    public int? UnitId { get; set; }

    [Column("scale_ratio")]
    public double? ScaleRatio { get; set; }

    [Column("include_unit")]
    public bool? IncludeUnit { get; set; }

    // Navigation properties
    [ForeignKey("StudyId")]
    public virtual EpStudyMaster? Study { get; set; }
}
