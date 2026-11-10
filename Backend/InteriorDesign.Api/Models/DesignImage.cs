namespace InteriorDesign.Api.Models;

public sealed class DesignImage
{
    public int DesignId { get; set; }
    public Design Design { get; set; } = null!;
    public int ImageAssetId { get; set; }
    public ImageAsset ImageAsset { get; set; } = null!;
}
