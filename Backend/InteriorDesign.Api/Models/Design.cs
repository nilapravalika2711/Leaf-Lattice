namespace InteriorDesign.Api.Models;

public sealed class Design
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = "";
    public required string Category { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<DesignImage> DesignImages { get; set; } = new List<DesignImage>();
    public ICollection<DesignMaterial> DesignMaterials { get; set; } = new List<DesignMaterial>();
}
