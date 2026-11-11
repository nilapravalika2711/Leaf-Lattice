namespace InteriorDesign.Api.Models;

public sealed class PurchaseRequest
{
    public int Id { get; set; }

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;

    public required string CustomerName { get; set; }
    public required string CustomerEmail { get; set; }
    public required string PhoneNumber { get; set; }

    public int DesignId { get; set; }
    public Design Design { get; set; } = null!;

    public decimal DesignPrice { get; set; }
    public required string DeliveryAddress { get; set; }
    public string? AdditionalRequirements { get; set; }
    public required string PreferredContactMethod { get; set; }

    public string Status { get; set; } = "Pending";
    public string? AdminResponse { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
