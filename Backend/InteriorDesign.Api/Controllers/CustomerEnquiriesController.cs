using System.Security.Claims;
using InteriorDesign.Api.Data;
using InteriorDesign.Api.DTOs.EnquiriesAndRequests;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Controllers;

[ApiController, Authorize(Roles = "Customer"), Route("api/customer/enquiries")]
public sealed class CustomerEnquiriesController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<EnquiryResponse>> Submit(CustomerCreateEnquiryRequest request, CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
            return Unauthorized();

        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Id == customerId, ct);
        if (customer is null) return Unauthorized(new { message = "Customer account not found." });

        var design = await db.Designs.FirstOrDefaultAsync(x => x.Id == request.DesignId, ct);
        if (design is null || !design.IsPublished)
            return BadRequest(new { message = "Enquiries can only be submitted for published designs." });

        // Prevent duplicate rapid submissions
        var recentCutoff = DateTime.UtcNow.AddSeconds(-10);
        var isDuplicate = await db.CustomerEnquiries.AnyAsync(
            x => x.CustomerId == customerId &&
                 x.DesignId == design.Id &&
                 x.Message == request.Message.Trim() &&
                 x.CreatedAtUtc >= recentCutoff, ct);

        if (isDuplicate)
            return BadRequest(new { message = "A duplicate enquiry was recently submitted. Please wait a moment." });

        var enquiry = new CustomerEnquiry
        {
            CustomerId = customer.Id,
            Customer = customer,
            CustomerName = customer.FullName,
            CustomerEmail = customer.Email,
            PhoneNumber = request.PhoneNumber.Trim(),
            DesignId = design.Id,
            Design = design,
            EnquiryType = request.EnquiryType.Trim(),
            Message = request.Message.Trim(),
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        db.CustomerEnquiries.Add(enquiry);
        await db.SaveChangesAsync(ct);

        return Ok(enquiry.ToResponse());
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EnquiryResponse>>> ListMine(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var customerId))
            return Unauthorized();

        var list = await db.CustomerEnquiries
            .AsNoTracking()
            .Include(x => x.Design)
            .Where(x => x.CustomerId == customerId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => x.ToResponse())
            .ToListAsync(ct);

        return Ok(list);
    }
}
