using AtomicHabits.Api.Features.Habits;

namespace AtomicHabits.Api.Features.Reminders;

public sealed class HabitReminder
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid HabitId { get; set; }

    public Habit? Habit { get; set; }

    public bool Enabled { get; set; }

    public TimeOnly TriggerTime { get; set; }

    public string TimeZone { get; set; } = "Europe/Istanbul";

    public string Channel { get; set; } = "local";

    public string DaysOfWeek { get; set; } = "1,2,3,4,5,6,7";

    public TimeOnly? QuietHoursStart { get; set; }

    public TimeOnly? QuietHoursEnd { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
