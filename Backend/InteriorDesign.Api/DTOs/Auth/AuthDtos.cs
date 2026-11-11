using System.ComponentModel.DataAnnotations;

namespace InteriorDesign.Api.DTOs.Auth;

public sealed class LoginRequest
{
    [Required, StringLength(160)] public string Identifier { get; set; } = "";
    [Required, StringLength(256)] public string Password { get; set; } = "";
}
public sealed record LoginResponse(string Token, DateTime ExpiresAtUtc, string Username, string Email, string Role = "Admin", string? FullName = null);
public sealed record AdminResponse(int Id, string Username, string Email);

public sealed class CustomerRegisterRequest
{
    [Required, StringLength(120, MinimumLength = 2)] public string FullName { get; set; } = "";
    [Required, EmailAddress, StringLength(160)] public string Email { get; set; } = "";
    [Required, StringLength(256, MinimumLength = 6)] public string Password { get; set; } = "";
}

public sealed class CustomerLoginRequest
{
    [Required, EmailAddress, StringLength(160)] public string Email { get; set; } = "";
    [Required, StringLength(256)] public string Password { get; set; } = "";
}

public sealed record CustomerAuthResponse(string Token, DateTime ExpiresAtUtc, string FullName, string Email);

