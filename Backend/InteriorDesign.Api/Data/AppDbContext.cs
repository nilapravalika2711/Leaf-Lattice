using InteriorDesign.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Admin> Admins => Set<Admin>();
    public DbSet<ImageAsset> Images => Set<ImageAsset>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<Design> Designs => Set<Design>();
    public DbSet<DesignImage> DesignImages => Set<DesignImage>();
    public DbSet<DesignMaterial> DesignMaterials => Set<DesignMaterial>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<Admin>().HasIndex(x => x.Username).IsUnique();
        modelBuilder.Entity<Material>().Property(x => x.Price).HasPrecision(12, 2);
        modelBuilder.Entity<Design>().Property(x => x.TotalPrice).HasPrecision(12, 2);
        modelBuilder.Entity<DesignImage>().HasKey(x => new { x.DesignId, x.ImageAssetId });
        modelBuilder.Entity<DesignImage>().HasOne(x => x.Design).WithMany(x => x.DesignImages).HasForeignKey(x => x.DesignId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DesignImage>().HasOne(x => x.ImageAsset).WithMany(x => x.DesignImages).HasForeignKey(x => x.ImageAssetId).OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<DesignMaterial>().HasKey(x => new { x.DesignId, x.MaterialId });
        modelBuilder.Entity<DesignMaterial>().HasOne(x => x.Design).WithMany(x => x.DesignMaterials).HasForeignKey(x => x.DesignId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<DesignMaterial>().HasOne(x => x.Material).WithMany(x => x.DesignMaterials).HasForeignKey(x => x.MaterialId).OnDelete(DeleteBehavior.Restrict);
    }
}
