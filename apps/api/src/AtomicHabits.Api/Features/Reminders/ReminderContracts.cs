namespace AtomicHabits.Api.Features.Reminders;

public sealed record UpsertHabitReminderRequest(
    bool Enabled,
    string TriggerTime,
    string? TimeZone,
    string? Channel,
    IReadOnlyCollection<int>? DaysOfWeek,
    string? QuietHoursStart,
    string? QuietHoursEnd);

public sealed record HabitReminderResponse(
    Guid Id,
    Guid HabitId,
    bool Enabled,
    string TriggerTime,
    string TimeZone,
    string Channel,
    IReadOnlyCollection<int> DaysOfWeek,
    string? QuietHoursStart,
    string? QuietHoursEnd,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class ReminderMapping
{
    public static HabitReminderResponse ToResponse(this HabitReminder reminder)
    {
        return new HabitReminderResponse(
            reminder.Id,
            reminder.HabitId,
            reminder.Enabled,
            FormatTime(reminder.TriggerTime),
            reminder.TimeZone,
            reminder.Channel,
            ParseDaysOfWeek(reminder.DaysOfWeek),
            reminder.QuietHoursStart is null ? null : FormatTime(reminder.QuietHoursStart.Value),
            reminder.QuietHoursEnd is null ? null : FormatTime(reminder.QuietHoursEnd.Value),
            reminder.CreatedAt,
            reminder.UpdatedAt);
    }

    public static string FormatTime(TimeOnly time)
    {
        return time.ToString("HH:mm");
    }

    public static IReadOnlyCollection<int> ParseDaysOfWeek(string daysOfWeek)
    {
        if (string.IsNullOrWhiteSpace(daysOfWeek))
        {
            return [];
        }

        return daysOfWeek
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(int.Parse)
            .Order()
            .ToArray();
    }
}
