using InteriorDesign.Api.Data;
using InteriorDesign.Api.DTOs.EnquiriesAndRequests;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Admin"), Route("api/admin/enquiries")]
public sealed class AdminEnquiriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EnquiryResponse>>> List(
        [FromQuery] string? status,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var query = db.CustomerEnquiries
            .AsNoTracking()
            .Include(x => x.Design)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x =>
                x.CustomerName.ToLower().Contains(term) ||
                x.CustomerEmail.ToLower().Contains(term) ||
                (x.Design != null && x.Design.Name.ToLower().Contains(term))
            );
        }

        var list = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.ToResponse())
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EnquiryResponse>> Get(int id, CancellationToken ct)
    {
        var enquiry = await db.CustomerEnquiries
            .AsNoTracking()
            .Include(x => x.Design)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (enquiry is null) return NotFound(new { message = "Enquiry not found." });
        return Ok(enquiry.ToResponse());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EnquiryResponse>> UpdateStatus(
        int id,
        UpdateEnquiryStatusRequest request,
        CancellationToken ct)
    {
        var enquiry = await db.CustomerEnquiries
            .Include(x => x.Design)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (enquiry is null) return NotFound(new { message = "Enquiry not found." });

        enquiry.Status = request.Status;
        enquiry.AdminResponse = string.IsNullOrWhiteSpace(request.AdminResponse) ? null : request.AdminResponse.Trim();
        enquiry.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Ok(enquiry.ToResponse());
    }
}
