using System.ComponentModel.DataAnnotations;
using InteriorDesign.Api.DTOs.Images;
using InteriorDesign.Api.DTOs.Materials;

namespace InteriorDesign.Api.DTOs.Designs;

public sealed class DesignUpsertRequest
{
    [Required, StringLength(120, MinimumLength = 2)] public string Name { get; set; } = "";
    [StringLength(3000)] public string Description { get; set; } = "";
    [Required, StringLength(80)] public string Category { get; set; } = "";
    [Range(typeof(decimal), "0", "9999999999")] public decimal TotalPrice { get; set; }
    public int[] ImageIds { get; set; } = [];
    public int[] MaterialIds { get; set; } = [];
    public bool IsPublished { get; set; } = true;
}
public sealed record DesignResponse(int Id, string Name, string Description, string Category, decimal TotalPrice, bool IsPublished, DateTime CreatedAtUtc, DateTime UpdatedAtUtc, IReadOnlyList<ImageResponse> Images, IReadOnlyList<MaterialResponse> Materials);
