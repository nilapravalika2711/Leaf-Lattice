namespace InteriorDesign.Api.Models;

public sealed class DesignMaterial
{
    public int DesignId { get; set; }
    public Design Design { get; set; } = null!;
    public int MaterialId { get; set; }
    public Material Material { get; set; } = null!;
}
