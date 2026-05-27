using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Reminders;

public static class ReminderEndpoints
{
    private static readonly HashSet<string> SupportedChannels = ["local", "push"];

    public static IEndpointRouteBuilder MapReminderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/habits/{habitId:guid}/reminders")
            .WithTags("Reminders")
            .RequireAuthorization();

        group.MapGet("/", GetReminder)
            .WithName("GetHabitReminder");

        group.MapPut("/", UpsertReminder)
            .WithName("UpsertHabitReminder");

        group.MapDelete("/", DisableReminder)
            .WithName("DisableHabitReminder");

        return app;
    }

    private static async Task<IResult> GetReminder(
        Guid habitId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (!await UserOwnsHabitAsync(dbContext, currentUser.UserId, habitId, cancellationToken))
        {
            return Results.NotFound();
        }

        var reminder = await dbContext.HabitReminders
            .AsNoTracking()
            .FirstOrDefaultAsync(
                reminder => reminder.HabitId == habitId,
                cancellationToken);

        return reminder is null ? Results.NotFound() : Results.Ok(reminder.ToResponse());
    }

    private static async Task<IResult> UpsertReminder(
        Guid habitId,
        UpsertHabitReminderRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        if (!await UserOwnsHabitAsync(dbContext, currentUser.UserId, habitId, cancellationToken))
        {
            return Results.NotFound();
        }

        if (!TryParseTime(request.TriggerTime, out var triggerTime))
        {
            return Results.BadRequest(new { error = "triggerTime must use HH:mm format." });
        }

        if (!TryNormalizeDays(request.DaysOfWeek, out var daysOfWeek, out var daysError))
        {
            return Results.BadRequest(new { error = daysError });
        }

        if (!TryParseOptionalTime(request.QuietHoursStart, out var quietHoursStart))
        {
            return Results.BadRequest(new { error = "quietHoursStart must use HH:mm format." });
        }

        if (!TryParseOptionalTime(request.QuietHoursEnd, out var quietHoursEnd))
        {
            return Results.BadRequest(new { error = "quietHoursEnd must use HH:mm format." });
        }

        var channel = Normalize(request.Channel, "local");
        if (!SupportedChannels.Contains(channel))
        {
            return Results.BadRequest(new { error = "channel must be local or push." });
        }

        var now = clock.UtcNow;
        var reminder = await dbContext.HabitReminders
            .FirstOrDefaultAsync(
                reminder => reminder.HabitId == habitId,
                cancellationToken);

        if (reminder is null)
        {
            reminder = new HabitReminder
            {
                HabitId = habitId,
                CreatedAt = now
            };

            dbContext.HabitReminders.Add(reminder);
        }

        reminder.Enabled = request.Enabled;
        reminder.TriggerTime = triggerTime;
        reminder.TimeZone = string.IsNullOrWhiteSpace(request.TimeZone)
            ? "Europe/Istanbul"
            : request.TimeZone.Trim();
        reminder.Channel = channel;
        reminder.DaysOfWeek = string.Join(',', daysOfWeek.Order());
        reminder.QuietHoursStart = quietHoursStart;
        reminder.QuietHoursEnd = quietHoursEnd;
        reminder.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Ok(reminder.ToResponse());
    }

    private static async Task<IResult> DisableReminder(
        Guid habitId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        if (!await UserOwnsHabitAsync(dbContext, currentUser.UserId, habitId, cancellationToken))
        {
            return Results.NotFound();
        }

        var reminder = await dbContext.HabitReminders
            .FirstOrDefaultAsync(
                reminder => reminder.HabitId == habitId,
                cancellationToken);

        if (reminder is null)
        {
            return Results.NoContent();
        }

        reminder.Enabled = false;
        reminder.UpdatedAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<bool> UserOwnsHabitAsync(
        AtomicHabitsDbContext dbContext,
        Guid userId,
        Guid habitId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Habits.AnyAsync(
            habit => habit.Id == habitId && habit.UserId == userId && !habit.IsArchived,
            cancellationToken);
    }

    private static bool TryNormalizeDays(
        IReadOnlyCollection<int>? requestedDays,
        out IReadOnlyCollection<int> daysOfWeek,
        out string error)
    {
        var days = requestedDays is null || requestedDays.Count == 0
            ? [1, 2, 3, 4, 5, 6, 7]
            : requestedDays.Distinct().Order().ToArray();

        if (days.Any(day => day is < 1 or > 7))
        {
            daysOfWeek = [];
            error = "daysOfWeek values must be between 1 and 7.";
            return false;
        }

        daysOfWeek = days;
        error = string.Empty;
        return true;
    }

    private static bool TryParseOptionalTime(string? value, out TimeOnly? time)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            time = null;
            return true;
        }

        var parsed = TryParseTime(value, out var requiredTime);
        time = parsed ? requiredTime : null;
        return parsed;
    }

    private static bool TryParseTime(string? value, out TimeOnly time)
    {
        return TimeOnly.TryParseExact(value, "HH:mm", out time);
    }

    private static string Normalize(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value)
            ? fallback
            : value.Trim().ToLowerInvariant();
    }
}
