using System.Security.Cryptography;
using System.Text;

namespace InteriorDesign.Api.Services;

public interface IPasswordService
{
    string Hash(string password);
    bool Verify(string password, string encodedHash);
}

public sealed class PasswordService : IPasswordService
{
    private const int Iterations = 600_000;
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var key = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
        return $"pbkdf2-sha256${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(key)}";
    }
    public bool Verify(string password, string encodedHash)
    {
        try
        {
            var parts = encodedHash.Split('$');
            if (parts.Length != 4 || parts[0] != "pbkdf2-sha256") return false;
            var salt = Convert.FromBase64String(parts[2]);
            var stored = Convert.FromBase64String(parts[3]);
            var computed = Rfc2898DeriveBytes.Pbkdf2(password, salt, int.Parse(parts[1]), HashAlgorithmName.SHA256, stored.Length);
            return CryptographicOperations.FixedTimeEquals(computed, stored);
        }
        catch { return false; }
    }
}

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) CreateToken(int adminId, string username, string email);
}

public sealed class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public (string Token, DateTime ExpiresAtUtc) CreateToken(int adminId, string username, string email)
    {
        var key = configuration["Jwt:SigningKey"] ?? "";
        if (Encoding.UTF8.GetByteCount(key) < 32) throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 bytes.");
        var expires = DateTime.UtcNow.AddHours(8);
        var header = Encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        var payload = Encode(System.Text.Json.JsonSerializer.Serialize(new
        {
            iss = configuration["Jwt:Issuer"], aud = configuration["Jwt:Audience"], sub = adminId.ToString(),
            name = username, email, iat = DateTimeOffset.UtcNow.ToUnixTimeSeconds(), exp = new DateTimeOffset(expires).ToUnixTimeSeconds()
        }));
        var unsigned = header + "." + payload;
        var signature = HMACSHA256.HashData(Encoding.UTF8.GetBytes(key), Encoding.ASCII.GetBytes(unsigned));
        return (unsigned + "." + Convert.ToBase64String(signature).TrimEnd('=').Replace('+', '-').Replace('/', '_'), expires);
    }
    private static string Encode(string value) => Convert.ToBase64String(Encoding.UTF8.GetBytes(value)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
