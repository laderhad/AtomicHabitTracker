using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Auth;

public sealed class UserSession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string RefreshTokenHash { get; set; } = string.Empty;

    public string DeviceName { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? LastUsedAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public Guid? ReplacedBySessionId { get; set; }

    public bool IsActive(DateTimeOffset now)
    {
        return RevokedAt is null && ExpiresAt > now;
    }
}
