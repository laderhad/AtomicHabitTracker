using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AtomicHabits.Api.Features.Auth;

public interface ITokenService
{
    Task<AuthResponse> IssueTokenPairAsync(
        ApplicationUser user,
        string? deviceName,
        CancellationToken cancellationToken);

    Task<AuthResponse?> RefreshTokenPairAsync(
        string refreshToken,
        CancellationToken cancellationToken);

    Task<bool> RevokeRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken);
}

public sealed class TokenService(
    AtomicHabitsDbContext dbContext,
    IClock clock,
    IOptions<JwtOptions> jwtOptions) : ITokenService
{
    public async Task<AuthResponse> IssueTokenPairAsync(
        ApplicationUser user,
        string? deviceName,
        CancellationToken cancellationToken)
    {
        var accessToken = CreateAccessToken(user);
        var refreshToken = RefreshTokenHasher.CreateToken();
        var now = clock.UtcNow;

        dbContext.UserSessions.Add(new UserSession
        {
            UserId = user.Id,
            RefreshTokenHash = RefreshTokenHasher.Hash(refreshToken),
            DeviceName = string.IsNullOrWhiteSpace(deviceName) ? "unknown" : deviceName.Trim(),
            CreatedAt = now,
            ExpiresAt = now.AddDays(jwtOptions.Value.RefreshTokenDays)
        });

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken,
            now.AddDays(jwtOptions.Value.RefreshTokenDays),
            user.ToProfileResponse());
    }

    public async Task<AuthResponse?> RefreshTokenPairAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return null;
        }

        var now = clock.UtcNow;
        var refreshTokenHash = RefreshTokenHasher.Hash(refreshToken);
        var session = await dbContext.UserSessions
            .Include(session => session.User)
            .FirstOrDefaultAsync(
                session => session.RefreshTokenHash == refreshTokenHash,
                cancellationToken);

        if (session?.User is null || !session.IsActive(now))
        {
            return null;
        }

        var nextRefreshToken = RefreshTokenHasher.CreateToken();
        var nextSession = new UserSession
        {
            UserId = session.UserId,
            RefreshTokenHash = RefreshTokenHasher.Hash(nextRefreshToken),
            DeviceName = session.DeviceName,
            CreatedAt = now,
            ExpiresAt = now.AddDays(jwtOptions.Value.RefreshTokenDays)
        };

        session.RevokedAt = now;
        session.LastUsedAt = now;
        session.ReplacedBySessionId = nextSession.Id;
        dbContext.UserSessions.Add(nextSession);

        var accessToken = CreateAccessToken(session.User);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            accessToken.Token,
            accessToken.ExpiresAt,
            nextRefreshToken,
            nextSession.ExpiresAt,
            session.User.ToProfileResponse());
    }

    public async Task<bool> RevokeRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return false;
        }

        var refreshTokenHash = RefreshTokenHasher.Hash(refreshToken);
        var session = await dbContext.UserSessions
            .FirstOrDefaultAsync(
                session => session.RefreshTokenHash == refreshTokenHash,
                cancellationToken);

        if (session is null || session.RevokedAt is not null)
        {
            return false;
        }

        session.RevokedAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private AccessToken CreateAccessToken(ApplicationUser user)
    {
        var options = jwtOptions.Value;
        if (string.IsNullOrWhiteSpace(options.SigningKey) || options.SigningKey.Length < 32)
        {
            throw new InvalidOperationException("Jwt:SigningKey must be at least 32 characters.");
        }

        var now = clock.UtcNow;
        var expiresAt = now.AddMinutes(options.AccessTokenMinutes);
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SigningKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new("preferred_language", user.PreferredLanguage),
            new("timezone", user.TimeZone)
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Issuer = options.Issuer,
            Audience = options.Audience,
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = credentials
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(descriptor);
        return new AccessToken(handler.WriteToken(token), expiresAt);
    }

    private sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);
}
