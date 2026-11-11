using System.Security.Claims;
using InteriorDesign.Api.Data;
using InteriorDesign.Api.DTOs.EnquiriesAndRequests;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Customer"), Route("api/customer/purchase-requests")]
public sealed class CustomerPurchaseRequestsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<PurchaseRequestResponse>> Submit(CustomerCreatePurchaseRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
            return Unauthorized();

        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Id == customerId, ct);
        if (customer is null) return Unauthorized(new { message = "Customer account not found." });

        var design = await db.Designs.FirstOrDefaultAsync(x => x.Id == request.DesignId, ct);
        if (design is null || !design.IsPublished)
            return BadRequest(new { message = "Purchase requests can only be placed for published designs." });

        // Prevent duplicate rapid submissions
        var recentCutoff = DateTime.UtcNow.AddSeconds(-10);
        var isDuplicate = await db.PurchaseRequests.AnyAsync(
            x => x.CustomerId == customerId &&
                 x.DesignId == design.Id &&
                 x.DeliveryAddress == request.DeliveryAddress.Trim() &&
                 x.CreatedAtUtc >= recentCutoff, ct);

        if (isDuplicate)
            return BadRequest(new { message = "A duplicate purchase request was recently submitted. Please wait a moment." });

        var purchaseRequest = new PurchaseRequest
        {
            CustomerId = customer.Id,
            Customer = customer,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            PhoneNumber = request.PhoneNumber.Trim(),
            DesignId = design.Id,
            Design = design,
            // Always retrieve actual price from the database
            DesignPrice = design.TotalPrice,
            DeliveryAddress = request.DeliveryAddress.Trim(),
            AdditionalRequirements = string.IsNullOrWhiteSpace(request.AdditionalRequirements) ? null : request.AdditionalRequirements.Trim(),
            PreferredContactMethod = request.PreferredContactMethod,
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        db.PurchaseRequests.Add(purchaseRequest);
        await db.SaveChangesAsync(ct);

        return Ok(purchaseRequest.ToResponse());
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PurchaseRequestResponse>>> ListMine(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
            return Unauthorized();

        var list = await db.PurchaseRequests
            .AsNoTracking()
            .Include(x => x.Design)
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.ToResponse())
            .ToListAsync(ct);

        return Ok(list);
    }
}
