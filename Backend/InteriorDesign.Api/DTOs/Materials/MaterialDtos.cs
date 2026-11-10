using System.ComponentModel.DataAnnotations;

namespace InteriorDesign.Api.DTOs.Materials;

public sealed class MaterialUpsertRequest
{
    [Required, StringLength(120, MinimumLength = 2)] public string Name { get; set; } = "";
    [StringLength(2000)] public string Description { get; set; } = "";
    [Range(typeof(decimal), "0", "9999999999")] public decimal Price { get; set; }
    public IFormFile? File { get; set; }
}
public sealed record MaterialResponse(int Id, string Name, string Description, decimal Price, string? ImagePath, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
