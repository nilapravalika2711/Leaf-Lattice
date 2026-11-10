using System.ComponentModel.DataAnnotations;

namespace InteriorDesign.Api.DTOs.Auth;

public sealed class LoginRequest
{
    [Required, StringLength(160)] public string Identifier { get; set; } = "";
    [Required, StringLength(256)] public string Password { get; set; } = "";
}
public sealed record LoginResponse(string Token, DateTime ExpiresAtUtc, string Username, string Email);
public sealed record AdminResponse(int Id, string Username, string Email);
