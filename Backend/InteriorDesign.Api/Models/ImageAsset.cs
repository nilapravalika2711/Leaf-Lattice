namespace InteriorDesign.Api.Models;

public sealed class ImageAsset
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = "";
    public required string ImagePath { get; set; }
    public required string ContentType { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<DesignImage> DesignImages { get; set; } = new List<DesignImage>();
}
