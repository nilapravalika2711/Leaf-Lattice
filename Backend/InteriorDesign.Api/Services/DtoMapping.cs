using InteriorDesign.Api.DTOs.Designs;
using InteriorDesign.Api.DTOs.Images;
using InteriorDesign.Api.DTOs.Materials;
using InteriorDesign.Api.Models;

namespace InteriorDesign.Api.Services;

public static class DtoMapping
{
    public static ImageResponse ToResponse(this ImageAsset x) => new(x.Id, x.Name, x.Description, x.ImagePath, x.ContentType, x.CreatedAtUtc, x.UpdatedAtUtc);
    public static MaterialResponse ToResponse(this Material x) => new(x.Id, x.Name, x.Description, x.Price, x.ImagePath, x.CreatedAtUtc, x.UpdatedAtUtc);
    public static DesignResponse ToResponse(this Design x) => new(
        x.Id, x.Name, x.Description, x.Category, x.TotalPrice, x.IsPublished, x.CreatedAtUtc, x.UpdatedAtUtc,
        x.DesignImages.Select(link => link.ImageAsset.ToResponse()).ToList(),
        x.DesignMaterials.Select(link => link.Material.ToResponse()).ToList());
}
