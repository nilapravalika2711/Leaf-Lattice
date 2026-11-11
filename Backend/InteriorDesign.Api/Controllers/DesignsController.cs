using InteriorDesign.Api.DTOs.Designs;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Repositories;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Admin"), Route("api/designs")]
public sealed class DesignsController(IDesignRepository designs) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DesignResponse>>> List(CancellationToken ct) => Ok((await designs.ListAsync(ct)).Select(x => x.ToResponse()).ToList());
    [HttpGet("{id:int}")]
    public async Task<ActionResult<DesignResponse>> Get(int id, CancellationToken ct)
    {
        var design = await designs.FindAsync(id, ct); return design is null ? NotFound() : Ok(design.ToResponse());
    }
    [HttpPost]
    public async Task<ActionResult<DesignResponse>> Create(DesignUpsertRequest request, CancellationToken ct)
    {
        var links = await ResolveLinks(request, ct);
        if (links.Error is not null) return BadRequest(new { message = links.Error });
        var item = new Design
        {
            Name = request.Name.Trim(), Description = request.Description.Trim(), Category = request.Category.Trim(), TotalPrice = request.TotalPrice,
            IsPublished = request.IsPublished,
            DesignImages = links.Images.Select(x => new DesignImage { ImageAsset = x }).ToList(),
            DesignMaterials = links.Materials.Select(x => new DesignMaterial { Material = x }).ToList()
        };
        designs.Add(item); await designs.SaveChangesAsync(ct);
        var saved = await designs.FindAsync(item.Id, ct);
        return CreatedAtAction(nameof(Get), new { id = item.Id }, saved!.ToResponse());
    }
    [HttpPut("{id:int}")]
    public async Task<ActionResult<DesignResponse>> Update(int id, DesignUpsertRequest request, CancellationToken ct)
    {
        var item = await designs.FindAsync(id, ct); if (item is null) return NotFound();
        var links = await ResolveLinks(request, ct);
        if (links.Error is not null) return BadRequest(new { message = links.Error });
        item.Name = request.Name.Trim(); item.Description = request.Description.Trim(); item.Category = request.Category.Trim();
        item.TotalPrice = request.TotalPrice; item.IsPublished = request.IsPublished; item.UpdatedAtUtc = DateTime.UtcNow;
        item.DesignImages.Clear();
        foreach (var image in links.Images) item.DesignImages.Add(new DesignImage { DesignId = item.Id, ImageAssetId = image.Id, ImageAsset = image });
        item.DesignMaterials.Clear();
        foreach (var material in links.Materials) item.DesignMaterials.Add(new DesignMaterial { DesignId = item.Id, MaterialId = material.Id, Material = material });
        await designs.SaveChangesAsync(ct);
        return Ok((await designs.FindAsync(id, ct))!.ToResponse());
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var item = await designs.FindAsync(id, ct); if (item is null) return NotFound();
        designs.Remove(item); await designs.SaveChangesAsync(ct); return NoContent();
    }

    private async Task<(List<ImageAsset> Images, List<Material> Materials, string? Error)> ResolveLinks(DesignUpsertRequest request, CancellationToken ct)
    {
        var imageIds = request.ImageIds.Distinct().ToArray();
        var materialIds = request.MaterialIds.Distinct().ToArray();
        if (imageIds.Length == 0) return ([], [], "Select at least one design image.");
        var images = await designs.GetImagesAsync(imageIds, ct);
        var materials = await designs.GetMaterialsAsync(materialIds, ct);
        if (images.Count != imageIds.Length) return ([], [], "One or more selected images do not exist.");
        if (materials.Count != materialIds.Length) return ([], [], "One or more selected materials do not exist.");
        return (images, materials, null);
    }
}
