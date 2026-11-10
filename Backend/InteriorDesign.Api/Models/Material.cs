namespace InteriorDesign.Api.Models;

public sealed class Material
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public string? ImagePath { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<DesignMaterial> DesignMaterials { get; set; } = new List<DesignMaterial>();
}
