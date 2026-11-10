using InteriorDesign.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InteriorDesign.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAdminAsync(AppDbContext db, IConfiguration configuration, Services.IPasswordService passwords)
    {
        var email = configuration["SeedAdmin:Email"];
        var password = configuration["SeedAdmin:Password"];
        var configuredUsername = configuration["SeedAdmin:Username"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password)) return;
        var username = (string.IsNullOrWhiteSpace(configuredUsername) ? email.Split('@')[0] : configuredUsername).Trim().ToLowerInvariant();
        email = email.Trim().ToLowerInvariant();
        if (await db.Admins.AnyAsync(a => a.Email == email || a.Username == username)) return;
        db.Admins.Add(new Admin { Email = email, Username = username, PasswordHash = passwords.Hash(password) });
        await db.SaveChangesAsync();
    }
}
