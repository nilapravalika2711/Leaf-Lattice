using InteriorDesign.Api.Models;

namespace InteriorDesign.Api.Repositories;

public interface IImageRepository
{
    Task<List<ImageAsset>> ListAsync(CancellationToken ct);
    Task<ImageAsset?> FindAsync(int id, CancellationToken ct);
    Task<bool> IsUsedAsync(int id, CancellationToken ct);
    void Add(ImageAsset image);
    void Remove(ImageAsset image);
    Task SaveChangesAsync(CancellationToken ct);
}
public interface IMaterialRepository
{
    Task<List<Material>> ListAsync(CancellationToken ct);
    Task<Material?> FindAsync(int id, CancellationToken ct);
    Task<bool> IsUsedAsync(int id, CancellationToken ct);
    void Add(Material material);
    void Remove(Material material);
    Task SaveChangesAsync(CancellationToken ct);
}
public interface IDesignRepository
{
    Task<List<Design>> ListAsync(CancellationToken ct);
    Task<List<Design>> ListPublishedAsync(CancellationToken ct);
    Task<Design?> FindAsync(int id, CancellationToken ct);
    Task<Design?> FindPublishedAsync(int id, CancellationToken ct);
    Task<List<ImageAsset>> GetImagesAsync(IEnumerable<int> ids, CancellationToken ct);
    Task<List<Material>> GetMaterialsAsync(IEnumerable<int> ids, CancellationToken ct);
    void Add(Design design);
    void Remove(Design design);
    Task SaveChangesAsync(CancellationToken ct);
}
