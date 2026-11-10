using System.Security.Claims;
using InteriorDesign.Api.Data;
using InteriorDesign.Api.DTOs.Auth;
using InteriorDesign.Api.Models;
using InteriorDesign.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Controllers;

[ApiController, Route("api/auth")]
public sealed class AuthController(AppDbContext db, IPasswordService passwords, IJwtTokenService tokens) : ControllerBase
{
    [AllowAnonymous, HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var identifier = request.Identifier.Trim().ToLowerInvariant();
        var admin = await db.Admins.FirstOrDefaultAsync(x => x.Email == identifier || x.Username == identifier, ct);
        if (admin is null || !passwords.Verify(request.Password, admin.PasswordHash)) return Unauthorized(new { message = "Invalid username/email or password." });
        var (token, expires) = tokens.CreateToken(admin.Id, admin.Username, admin.Email);
        return Ok(new LoginResponse(token, expires, admin.Username, admin.Email));
    }

    [Authorize, HttpGet("me")]
    public async Task<ActionResult<AdminResponse>> Me(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var admin = await db.Admins.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return admin is null ? Unauthorized() : Ok(new AdminResponse(admin.Id, admin.Username, admin.Email));
    }
}
