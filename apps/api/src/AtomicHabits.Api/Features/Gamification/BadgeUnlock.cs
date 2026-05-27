using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Gamification;

public sealed class BadgeUnlock
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string BadgeCode { get; set; } = string.Empty;

    public DateTimeOffset UnlockedAt { get; set; }

    public DateTimeOffset? SeenAt { get; set; }

    public string ContextJson { get; set; } = "{}";
}
