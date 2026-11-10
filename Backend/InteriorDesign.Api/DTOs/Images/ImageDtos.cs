using System.ComponentModel.DataAnnotations;

namespace InteriorDesign.Api.DTOs.Images;

public sealed class ImageUpsertRequest
{
    [Required, StringLength(120, MinimumLength = 2)] public string Name { get; set; } = "";
    [StringLength(2000)] public string Description { get; set; } = "";
    public IFormFile? File { get; set; }
}
public sealed record ImageResponse(int Id, string Name, string Description, string ImagePath, string ContentType, DateTime CreatedAtUtc, DateTime UpdatedAtUtc);
