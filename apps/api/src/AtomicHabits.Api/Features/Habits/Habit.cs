using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Features.HabitLogs;
using AtomicHabits.Api.Features.Reminders;

namespace AtomicHabits.Api.Features.Habits;

public sealed class Habit
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "general";

    public string IdentityStatement { get; set; } = string.Empty;

    public string CueType { get; set; } = "time";

    public string CueText { get; set; } = string.Empty;

    public string RewardText { get; set; } = string.Empty;

    public string Difficulty { get; set; } = "easy";

    public bool IsPositive { get; set; } = true;

    public bool IsArchived { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<HabitLog> Logs { get; set; } = [];

    public HabitStreak? Streak { get; set; }

    public HabitReminder? Reminder { get; set; }
}
