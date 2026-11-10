using InteriorDesign.Api.DTOs.Images;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Repositories;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize, Route("api/images")]
public sealed class ImagesController(IImageRepository images, IFileStorageService files) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ImageResponse>>> List(CancellationToken ct) => Ok((await images.ListAsync(ct)).Select(x => x.ToResponse()).ToList());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ImageResponse>> Get(int id, CancellationToken ct)
    {
        var image = await images.FindAsync(id, ct);
        return image is null ? NotFound() : Ok(image.ToResponse());
    }

    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ImageResponse>> Create([FromForm] ImageUpsertRequest request, CancellationToken ct)
    {
        if (request.File is null) return BadRequest(new { message = "An image file is required." });
        string? uploadedPath = null;
        try
        {
            var (path, type) = await files.SaveImageAsync(request.File, "images", ct);
            uploadedPath = path;
            var image = new ImageAsset { Name = request.Name.Trim(), Description = request.Description.Trim(), ImagePath = path, ContentType = type };
            images.Add(image);
            await images.SaveChangesAsync(ct);
            return CreatedAtAction(nameof(Get), new { id = image.Id }, image.ToResponse());
        }
        catch (InvalidDataException ex) { return BadRequest(new { message = ex.Message }); }
        catch { await files.DeleteAsync(uploadedPath); throw; }
    }

    [HttpPut("{id:int}")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ImageResponse>> Update(int id, [FromForm] ImageUpsertRequest request, CancellationToken ct)
    {
        var image = await images.FindAsync(id, ct);
        if (image is null) return NotFound();
        string? uploadedPath = null;
        var oldPath = image.ImagePath;
        try
        {
            image.Name = request.Name.Trim(); image.Description = request.Description.Trim(); image.UpdatedAtUtc = DateTime.UtcNow;
            if (request.File is not null)
            {
                var (path, type) = await files.SaveImageAsync(request.File, "images", ct);
                uploadedPath = path; image.ImagePath = path; image.ContentType = type;
            }
            await images.SaveChangesAsync(ct);
            if (uploadedPath is not null) await files.DeleteAsync(oldPath);
            return Ok(image.ToResponse());
        }
        catch (InvalidDataException ex) { await files.DeleteAsync(uploadedPath); return BadRequest(new { message = ex.Message }); }
        catch { await files.DeleteAsync(uploadedPath); throw; }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var image = await images.FindAsync(id, ct);
        if (image is null) return NotFound();
        if (await images.IsUsedAsync(id, ct)) return Conflict(new { message = "This image is included in one or more designs. Remove it from those designs before deleting it." });
        images.Remove(image); await images.SaveChangesAsync(ct); await files.DeleteAsync(image.ImagePath);
        return NoContent();
    }
}

