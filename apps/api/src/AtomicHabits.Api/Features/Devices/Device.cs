using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Devices;

public sealed class Device
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string Platform { get; set; } = string.Empty;

    public string PushToken { get; set; } = string.Empty;

    public string AuthorizationStatus { get; set; } = "not_determined";

    public string DeviceName { get; set; } = string.Empty;

    public string AppVersion { get; set; } = string.Empty;

    public string TimeZone { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset LastSeenAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }
}
