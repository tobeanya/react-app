using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpansionPlanApi.Models;

[Table("ep_transmission_master")]
public class EpTransmissionMaster
{
    [Key]
    [Column("ep_transmission_id")]
    public int EpTransmissionId { get; set; }

    [Column("ep_transmission_group")]
    [StringLength(255)]
    public string? EpTransmissionGroup { get; set; }

    [Column("ep_scenario_id")]
    public int EpScenarioId { get; set; }

    [Column("transmission_group")]
    [StringLength(255)]
    public string TransmissionGroup { get; set; } = string.Empty;

    [Column("transmission_group_id")]
    public int TransmissionGroupId { get; set; }

    [Column("region_A_name")]
    [StringLength(255)]
    public string RegionAName { get; set; } = string.Empty;

    [Column("region_A_id")]
    public int RegionAId { get; set; }

    [Column("region_B_name")]
    [StringLength(255)]
    public string RegionBName { get; set; } = string.Empty;

    [Column("region_B_id")]
    public int RegionBId { get; set; }

    [Column("position")]
    public int Position { get; set; }

    [Column("incremental_cap_limit_in")]
    public double IncrementalCapLimitIn { get; set; }

    [Column("incremental_cap_limit_out")]
    public double IncrementalCapLimitOut { get; set; }

    [Column("start_year")]
    [StringLength(4)]
    public string? StartYear { get; set; }

    [Column("end_year")]
    [StringLength(4)]
    public string? EndYear { get; set; }

    [Column("max_number_of_build")]
    public int? MaxNumberOfBuild { get; set; }

    [Column("current_number_of_build")]
    public int? CurrentNumberOfBuild { get; set; }

    [Column("max_number_of_build_per_year")]
    public int? MaxNumberOfBuildPerYear { get; set; }

    [Column("current_number_of_build_per_year")]
    public int? CurrentNumberOfBuildPerYear { get; set; }

    [Column("cost")]
    public double? Cost { get; set; }

    [Column("is_selected")]
    public bool? IsSelected { get; set; }

    [Column("rate")]
    public double? Rate { get; set; }

    // Navigation properties
    [ForeignKey("EpScenarioId")]
    public virtual EpScenarioMaster? Scenario { get; set; }
}
