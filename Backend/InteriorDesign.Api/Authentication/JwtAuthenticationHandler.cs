using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Encodings.Web;

namespace InteriorDesign.Api.Authentication;

public sealed class JwtAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IConfiguration configuration) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorization = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authorization) || !authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.NoResult());
        try
        {
            var parts = authorization[7..].Trim().Split('.');
            var key = configuration["Jwt:SigningKey"] ?? "";
            if (parts.Length != 3 || Encoding.UTF8.GetByteCount(key) < 32) return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));
            var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.ASCII.GetBytes(parts[0] + "." + parts[1]));
            if (!CryptographicOperations.FixedTimeEquals(expected, Decode(parts[2]))) return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));
            using var header = JsonDocument.Parse(Decode(parts[0]));
            if (header.RootElement.GetProperty("alg").GetString() != "HS256" || header.RootElement.GetProperty("typ").GetString() != "JWT")
                return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));
            using var payload = JsonDocument.Parse(Decode(parts[1]));
            var root = payload.RootElement;
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (root.GetProperty("iss").GetString() != configuration["Jwt:Issuer"] ||
                root.GetProperty("aud").GetString() != configuration["Jwt:Audience"] ||
                root.GetProperty("exp").GetInt64() <= now)
                return Task.FromResult(AuthenticateResult.Fail("Expired or invalid bearer token."));
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, root.GetProperty("sub").GetString() ?? ""),
                new Claim(ClaimTypes.Name, root.GetProperty("name").GetString() ?? ""),
                new Claim(ClaimTypes.Email, root.GetProperty("email").GetString() ?? ""),
                new Claim(ClaimTypes.Role, "Admin")
            };
            var identity = new ClaimsIdentity(claims, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name)));
        }
        catch
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid bearer token."));
        }
    }

    private static byte[] Decode(string input)
    {
        var value = input.Replace('-', '+').Replace('_', '/');
        value += new string('=', (4 - value.Length % 4) % 4);
        return Convert.FromBase64String(value);
    }
}
