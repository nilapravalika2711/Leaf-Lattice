namespace InteriorDesign.Api.Models;

public sealed class Admin
{
    public int Id { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
