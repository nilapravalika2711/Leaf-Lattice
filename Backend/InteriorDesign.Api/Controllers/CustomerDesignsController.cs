using InteriorDesign.Api.DTOs.Designs;
using InteriorDesign.Api.Repositories;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Customer"), Route("api/customer/designs")]
public sealed class CustomerDesignsController(IDesignRepository designs) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DesignResponse>>> List(CancellationToken ct)
    {
        var published = await designs.ListPublishedAsync(ct);
        return Ok(published.Select(x => x.ToResponse()).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DesignResponse>> Get(int id, CancellationToken ct)
    {
        var design = await designs.FindPublishedAsync(id, ct);
        if (design is null) return NotFound(new { message = "Design not found or is currently unavailable." });
        return Ok(design.ToResponse());
    }
}
