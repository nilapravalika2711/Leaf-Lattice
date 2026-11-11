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
    public async Task<ActionResult<LoginResponse>> CommonLogin(LoginRequest request, CancellationToken ct)
    {
        var identifier = request.Identifier.Trim().ToLowerInvariant();

        // 1. Check Admin by Email or Username
        var admin = await db.Admins.FirstOrDefaultAsync(x => x.Email == identifier || x.Username == identifier, ct);
        if (admin is not null && passwords.Verify(request.Password, admin.PasswordHash))
        {
            var (token, expires) = tokens.CreateToken(admin.Id, admin.Username, admin.Email, "Admin");
            return Ok(new LoginResponse(token, expires, admin.Username, admin.Email, "Admin", admin.Username));
        }

        // 2. Check Customer by Email
        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Email == identifier, ct);
        if (customer is not null && passwords.Verify(request.Password, customer.PasswordHash))
        {
            var (token, expires) = tokens.CreateToken(customer.Id, customer.FullName, customer.Email, "Customer");
            return Ok(new LoginResponse(token, expires, customer.FullName, customer.Email, "Customer", customer.FullName));
        }

        return Unauthorized(new { message = "Invalid email, username, or password." });
    }

    [AllowAnonymous, HttpPost("admin/login")]
    public async Task<ActionResult<LoginResponse>> AdminLogin(LoginRequest request, CancellationToken ct)
    {
        var identifier = request.Identifier.Trim().ToLowerInvariant();
        var admin = await db.Admins.FirstOrDefaultAsync(x => x.Email == identifier || x.Username == identifier, ct);
        if (admin is null || !passwords.Verify(request.Password, admin.PasswordHash)) return Unauthorized(new { message = "Invalid username/email or password." });
        var (token, expires) = tokens.CreateToken(admin.Id, admin.Username, admin.Email, "Admin");
        return Ok(new LoginResponse(token, expires, admin.Username, admin.Email, "Admin", admin.Username));
    }

    [AllowAnonymous, HttpPost("customer/register")]
    public async Task<ActionResult<CustomerAuthResponse>> CustomerRegister(CustomerRegisterRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var name = request.FullName.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest(new { message = "Full name is required." });
        if (await db.Customers.AnyAsync(x => x.Email == email, ct))
            return Conflict(new { message = "An account with this email address already exists. Please sign in instead." });

        var customer = new Customer
        {
            FullName = name,
            Email = email,
            PasswordHash = passwords.Hash(request.Password)
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(ct);

        var (token, expires) = tokens.CreateToken(customer.Id, customer.FullName, customer.Email, "Customer");
        return Ok(new CustomerAuthResponse(token, expires, customer.FullName, customer.Email));
    }

    [AllowAnonymous, HttpPost("customer/login")]
    public async Task<ActionResult<CustomerAuthResponse>> CustomerLogin(CustomerLoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var customer = await db.Customers.FirstOrDefaultAsync(x => x.Email == email, ct);
        if (customer is null || !passwords.Verify(request.Password, customer.PasswordHash))
            return Unauthorized(new { message = "Invalid customer email or password." });

        var (token, expires) = tokens.CreateToken(customer.Id, customer.FullName, customer.Email, "Customer");
        return Ok(new CustomerAuthResponse(token, expires, customer.FullName, customer.Email));
    }

    [Authorize, HttpGet("me")]
    public async Task<ActionResult<AdminResponse>> Me(CancellationToken ct)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)) return Unauthorized();
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "Admin";
        if (role == "Customer")
        {
            var customer = await db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            return customer is null ? Unauthorized() : Ok(new AdminResponse(customer.Id, customer.FullName, customer.Email));
        }
        var admin = await db.Admins.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return admin is null ? Unauthorized() : Ok(new AdminResponse(admin.Id, admin.Username, admin.Email));
    }
}
