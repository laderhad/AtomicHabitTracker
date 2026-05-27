using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Features.HabitLogs;

namespace AtomicHabits.Api.Features.Challenges;

public sealed class ChallengeCheckIn
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ChallengeId { get; set; }

    public Challenge? Challenge { get; set; }

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public Guid HabitLogId { get; set; }

    public HabitLog? HabitLog { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
