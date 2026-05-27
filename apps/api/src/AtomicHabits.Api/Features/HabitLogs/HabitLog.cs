using AtomicHabits.Api.Features.Habits;

namespace AtomicHabits.Api.Features.HabitLogs;

public sealed class HabitLog
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid HabitId { get; set; }

    public Habit? Habit { get; set; }

    public DateTimeOffset OccurredAt { get; set; }

    public string Status { get; set; } = HabitLogStatuses.Completed;

    public decimal? Value { get; set; }

    public string Unit { get; set; } = string.Empty;

    public string Note { get; set; } = string.Empty;

    public string Source { get; set; } = "manual";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public static class HabitLogStatuses
{
    public const string Completed = "completed";

    public const string Skipped = "skipped";
}
