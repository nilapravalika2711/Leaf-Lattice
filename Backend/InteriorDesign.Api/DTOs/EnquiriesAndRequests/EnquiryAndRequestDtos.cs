using System.ComponentModel.DataAnnotations;

namespace InteriorDesign.Api.DTOs.EnquiriesAndRequests;

public sealed record CustomerCreateEnquiryRequest(
    [Required] int DesignId,
    [Required, StringLength(30, MinimumLength = 5)] string PhoneNumber,
    [Required, StringLength(100)] string EnquiryType,
    [Required, StringLength(3000, MinimumLength = 3)] string Message
);

public sealed record EnquiryResponse(
    int Id,
    int CustomerId,
    string CustomerName,
    string CustomerEmail,
    string PhoneNumber,
    int DesignId,
    string DesignName,
    string DesignCategory,
    decimal DesignTotalPrice,
    string EnquiryType,
    string Message,
    string Status,
    string? AdminResponse,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public sealed record CustomerCreatePurchaseRequest(
    [Required] int DesignId,
    [Required, StringLength(30, MinimumLength = 5)] string PhoneNumber,
    [Required, StringLength(500, MinimumLength = 5)] string DeliveryAddress,
    string? AdditionalRequirements,
    [Required, RegularExpression("^(Phone|Email)$", ErrorMessage = "Preferred contact method must be 'Phone' or 'Email'.")] string PreferredContactMethod
);

public sealed record PurchaseRequestResponse(
    int Id,
    int CustomerId,
    string CustomerName,
    string CustomerEmail,
    string PhoneNumber,
    int DesignId,
    string DesignName,
    string DesignCategory,
    decimal DesignPrice,
    string DeliveryAddress,
    string? AdditionalRequirements,
    string PreferredContactMethod,
    string Status,
    string? AdminResponse,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public sealed record UpdateEnquiryStatusRequest(
    [Required, RegularExpression("^(Pending|Contacted|Resolved|Rejected)$", ErrorMessage = "Invalid status. Allowed: Pending, Contacted, Resolved, Rejected.")] string Status,
    string? AdminResponse
);

public sealed record UpdatePurchaseRequestStatusRequest(
    [Required, RegularExpression("^(Pending|Contacted|Approved|Rejected|Completed)$", ErrorMessage = "Invalid status. Allowed: Pending, Contacted, Approved, Rejected, Completed.")] string Status,
    string? AdminResponse
);
