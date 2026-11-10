using InteriorDesign.Api.DTOs.Materials;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Repositories;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize, Route("api/materials")]
public sealed class MaterialsController(IMaterialRepository materials, IFileStorageService files) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MaterialResponse>>> List(CancellationToken ct) => Ok((await materials.ListAsync(ct)).Select(x => x.ToResponse()).ToList());
    [HttpGet("{id:int}")]
    public async Task<ActionResult<MaterialResponse>> Get(int id, CancellationToken ct)
    {
        var item = await materials.FindAsync(id, ct); return item is null ? NotFound() : Ok(item.ToResponse());
    }
    [HttpPost, RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<MaterialResponse>> Create([FromForm] MaterialUpsertRequest request, CancellationToken ct)
    {
        string? uploadedPath = null;
        try
        {
            string? path = null;
            if (request.File is not null) { var saved = await files.SaveImageAsync(request.File, "materials", ct); path = uploadedPath = saved.Path; }
            var item = new Material { Name = request.Name.Trim(), Description = request.Description.Trim(), Price = request.Price, ImagePath = path };
            materials.Add(item); await materials.SaveChangesAsync(ct);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item.ToResponse());
        }
        catch (InvalidDataException ex) { return BadRequest(new { message = ex.Message }); }
        catch { await files.DeleteAsync(uploadedPath); throw; }
    }
    [HttpPut("{id:int}"), RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<MaterialResponse>> Update(int id, [FromForm] MaterialUpsertRequest request, CancellationToken ct)
    {
        var item = await materials.FindAsync(id, ct); if (item is null) return NotFound();
        string? uploadedPath = null; var oldPath = item.ImagePath;
        try
        {
            item.Name = request.Name.Trim(); item.Description = request.Description.Trim(); item.Price = request.Price; item.UpdatedAtUtc = DateTime.UtcNow;
            if (request.File is not null) { var saved = await files.SaveImageAsync(request.File, "materials", ct); item.ImagePath = uploadedPath = saved.Path; }
            await materials.SaveChangesAsync(ct);
            if (uploadedPath is not null) await files.DeleteAsync(oldPath);
            return Ok(item.ToResponse());
        }
        catch (InvalidDataException ex) { await files.DeleteAsync(uploadedPath); return BadRequest(new { message = ex.Message }); }
        catch { await files.DeleteAsync(uploadedPath); throw; }
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var item = await materials.FindAsync(id, ct); if (item is null) return NotFound();
        if (await materials.IsUsedAsync(id, ct)) return Conflict(new { message = "This material is used by one or more designs. Remove it from those designs before deleting it." });
        materials.Remove(item); await materials.SaveChangesAsync(ct); await files.DeleteAsync(item.ImagePath); return NoContent();
    }
}

