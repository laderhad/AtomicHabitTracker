namespace AtomicHabits.Api.Features.Habits;

public sealed class HabitStreak
{
    public Guid HabitId { get; set; }

    public Habit? Habit { get; set; }

    public int CurrentStreak { get; set; }

    public int LongestStreak { get; set; }

    public DateOnly? LastCompletedOn { get; set; }

    public DateTimeOffset? LastCompletedAt { get; set; }
}
