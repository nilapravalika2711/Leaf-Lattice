using InteriorDesign.Api.Data;
using InteriorDesign.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Repositories;

public sealed class ImageRepository(AppDbContext db) : IImageRepository
{
    public Task<List<ImageAsset>> ListAsync(CancellationToken ct) => db.Images.AsNoTracking().OrderByDescending(x => x.CreatedAtUtc).ToListAsync(ct);
    public Task<ImageAsset?> FindAsync(int id, CancellationToken ct) => db.Images.FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> IsUsedAsync(int id, CancellationToken ct) => db.DesignImages.AnyAsync(x => x.ImageAssetId == id, ct);
    public void Add(ImageAsset image) => db.Images.Add(image);
    public void Remove(ImageAsset image) => db.Images.Remove(image);
    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
public sealed class MaterialRepository(AppDbContext db) : IMaterialRepository
{
    public Task<List<Material>> ListAsync(CancellationToken ct) => db.Materials.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
    public Task<Material?> FindAsync(int id, CancellationToken ct) => db.Materials.FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<bool> IsUsedAsync(int id, CancellationToken ct) => db.DesignMaterials.AnyAsync(x => x.MaterialId == id, ct);
    public void Add(Material material) => db.Materials.Add(material);
    public void Remove(Material material) => db.Materials.Remove(material);
    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
public sealed class DesignRepository(AppDbContext db) : IDesignRepository
{
    private IQueryable<Design> Complete => db.Designs.Include(x => x.DesignImages).ThenInclude(x => x.ImageAsset).Include(x => x.DesignMaterials).ThenInclude(x => x.Material);
    public Task<List<Design>> ListAsync(CancellationToken ct) => Complete.AsNoTracking().OrderByDescending(x => x.UpdatedAtUtc).ToListAsync(ct);
    public Task<List<Design>> ListPublishedAsync(CancellationToken ct) => Complete.AsNoTracking().Where(x => x.IsPublished).OrderByDescending(x => x.UpdatedAtUtc).ToListAsync(ct);
    public Task<Design?> FindAsync(int id, CancellationToken ct) => Complete.FirstOrDefaultAsync(x => x.Id == id, ct);
    public Task<Design?> FindPublishedAsync(int id, CancellationToken ct) => Complete.FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, ct);
    public Task<List<ImageAsset>> GetImagesAsync(IEnumerable<int> ids, CancellationToken ct) => db.Images.Where(x => ids.Contains(x.Id)).ToListAsync(ct);
    public Task<List<Material>> GetMaterialsAsync(IEnumerable<int> ids, CancellationToken ct) => db.Materials.Where(x => ids.Contains(x.Id)).ToListAsync(ct);
    public void Add(Design design) => db.Designs.Add(design);
    public void Remove(Design design) => db.Designs.Remove(design);
    public Task SaveChangesAsync(CancellationToken ct) => db.SaveChangesAsync(ct);
}
