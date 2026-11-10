namespace InteriorDesign.Api.Services;

public interface IFileStorageService
{
    Task<(string Path, string ContentType)> SaveImageAsync(IFormFile file, string category, CancellationToken cancellationToken);
    Task DeleteAsync(string? relativePath);
}

public sealed class FileStorageService(IWebHostEnvironment environment, IConfiguration configuration) : IFileStorageService
{
    private const int DefaultMaxSize = 5 * 1024 * 1024;
    public async Task<(string Path, string ContentType)> SaveImageAsync(IFormFile file, string category, CancellationToken cancellationToken)
    {
        var maxBytes = configuration.GetValue("Uploads:MaxFileSizeBytes", DefaultMaxSize);
        if (file.Length <= 0 || file.Length > maxBytes) throw new InvalidDataException($"Image must be between 1 byte and {maxBytes / 1024 / 1024} MB.");
        await using var input = file.OpenReadStream();
        var signature = new byte[12];
        var count = await input.ReadAsync(signature.AsMemory(0, signature.Length), cancellationToken);
        var (extension, contentType) = Detect(signature.AsSpan(0, count));
        if (extension is null) throw new InvalidDataException("Only valid JPEG, PNG, and WebP images are accepted.");
        var folder = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", category);
        Directory.CreateDirectory(folder);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(folder, fileName);
        input.Position = 0;
        await using (var output = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
            await input.CopyToAsync(output, cancellationToken);
        return ($"/uploads/{category}/{fileName}", contentType!);
    }
    public Task DeleteAsync(string? relativePath)
    {
        if (!string.IsNullOrWhiteSpace(relativePath) && relativePath.StartsWith("/uploads/", StringComparison.Ordinal))
        {
            var root = Path.GetFullPath(Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads"));
            var target = Path.GetFullPath(Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
            if (target.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) && File.Exists(target)) File.Delete(target);
        }
        return Task.CompletedTask;
    }
    private static (string? Extension, string? ContentType) Detect(ReadOnlySpan<byte> b)
    {
        if (b.Length >= 8 && b[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return (".png", "image/png");
        if (b.Length >= 3 && b[0] == 0xff && b[1] == 0xd8 && b[2] == 0xff) return (".jpg", "image/jpeg");
        if (b.Length >= 12 && b[..4].SequenceEqual("RIFF"u8) && b[8..12].SequenceEqual("WEBP"u8)) return (".webp", "image/webp");
        return (null, null);
    }
}

