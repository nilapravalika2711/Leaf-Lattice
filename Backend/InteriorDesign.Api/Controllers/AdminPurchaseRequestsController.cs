using InteriorDesign.Api.Data;
using InteriorDesign.Api.DTOs.EnquiriesAndRequests;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Admin"), Route("api/admin/purchase-requests")]
public sealed class AdminPurchaseRequestsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PurchaseRequestResponse>>> List(
        [FromQuery] string? status,
        [FromQuery] string? search,
        CancellationToken ct)
    {
        var query = db.PurchaseRequests
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
    public async Task<ActionResult<PurchaseRequestResponse>> Get(int id, CancellationToken ct)
    {
        var request = await db.PurchaseRequests
            .AsNoTracking()
            .Include(x => x.Design)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (request is null) return NotFound(new { message = "Purchase request not found." });
        return Ok(request.ToResponse());
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PurchaseRequestResponse>> UpdateStatus(
        int id,
        UpdatePurchaseRequestStatusRequest request,
        CancellationToken ct)
    {
        var purchaseRequest = await db.PurchaseRequests
            .Include(x => x.Design)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (purchaseRequest is null) return NotFound(new { message = "Purchase request not found." });

        purchaseRequest.Status = request.Status;
        purchaseRequest.AdminResponse = string.IsNullOrWhiteSpace(request.AdminResponse) ? null : request.AdminResponse.Trim();
        purchaseRequest.UpdatedAtUtc = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return Ok(purchaseRequest.ToResponse());
    }
}
