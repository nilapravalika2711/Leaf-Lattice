using InteriorDesign.Api.DTOs.Designs;
using InteriorDesign.Api.DTOs.EnquiriesAndRequests;
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

    public static EnquiryResponse ToResponse(this CustomerEnquiry x) => new(
        x.Id,
        x.CustomerId,
        x.CustomerName,
        x.CustomerEmail,
        x.PhoneNumber,
        x.DesignId,
        x.Design?.Name ?? "Design",
        x.Design?.Category ?? "Custom",
        x.Design?.TotalPrice ?? 0m,
        x.EnquiryType,
        x.Message,
        x.Status,
        x.AdminResponse,
        x.CreatedAtUtc,
        x.UpdatedAtUtc
    );

    public static PurchaseRequestResponse ToResponse(this PurchaseRequest x) => new(
        x.Id,
        x.CustomerId,
        x.CustomerName,
        x.CustomerEmail,
        x.PhoneNumber,
        x.DesignId,
        x.Design?.Name ?? "Design",
        x.Design?.Category ?? "Custom",
        x.DesignPrice,
        x.DeliveryAddress,
        x.AdditionalRequirements,
        x.PreferredContactMethod,
        x.Status,
        x.AdminResponse,
        x.CreatedAtUtc,
        x.UpdatedAtUtc
    );
}
