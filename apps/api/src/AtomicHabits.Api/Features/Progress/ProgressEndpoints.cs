using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.HabitLogs;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Progress;

public static class ProgressEndpoints
{
    public static IEndpointRouteBuilder MapProgressEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/dashboard")
            .WithTags("Dashboard")
            .RequireAuthorization();

        group.MapGet("/today", GetToday)
            .WithName("GetTodayDashboard");

        group.MapGet("/progress", GetProgress)
            .WithName("GetProgressDashboard");

        return app;
    }

    private static async Task<IResult> GetToday(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        var todayStart = new DateTimeOffset(today.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var tomorrowStart = todayStart.AddDays(1);

        var habits = await dbContext.Habits
            .AsNoTracking()
            .Where(habit => habit.UserId == currentUser.UserId && !habit.IsArchived)
            .OrderBy(habit => habit.CreatedAt)
            .Select(habit => new TodayHabitResponse(
                habit.Id,
                habit.Name,
                habit.Category,
                habit.CueText,
                habit.Logs.Any(log =>
                    log.Status == HabitLogStatuses.Completed &&
                    log.OccurredAt >= todayStart &&
                    log.OccurredAt < tomorrowStart)))
            .ToListAsync(cancellationToken);

        return Results.Ok(new TodayDashboardResponse(today, habits));
    }

    private static async Task<IResult> GetProgress(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(clock.UtcNow.UtcDateTime);
        var windowStart = today.AddDays(-6);
        var windowStartAt = new DateTimeOffset(windowStart.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var windowEndExclusive = new DateTimeOffset(today.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var habits = await dbContext.Habits
            .AsNoTracking()
            .Include(habit => habit.Streak)
            .Where(habit => habit.UserId == currentUser.UserId && !habit.IsArchived)
            .ToListAsync(cancellationToken);

        var habitIds = habits.Select(habit => habit.Id).ToArray();

        var logs = await dbContext.HabitLogs
            .AsNoTracking()
            .Where(log =>
                habitIds.Contains(log.HabitId) &&
                log.Status == HabitLogStatuses.Completed &&
                log.OccurredAt >= windowStartAt &&
                log.OccurredAt < windowEndExclusive)
            .ToListAsync(cancellationToken);

        var possibleCompletions = habits.Count * 7;
        var completedCompletions = logs
            .Select(log => new { log.HabitId, Day = DateOnly.FromDateTime(log.OccurredAt.Date) })
            .Distinct()
            .Count();

        var completionRate = possibleCompletions == 0
            ? 0
            : Math.Round((decimal)completedCompletions / possibleCompletions, 4);

        var streaks = habits
            .Select(habit => new HabitProgressResponse(
                habit.Id,
                habit.Name,
                habit.Streak?.CurrentStreak ?? 0,
                habit.Streak?.LongestStreak ?? 0))
            .OrderByDescending(item => item.CurrentStreak)
            .ThenBy(item => item.Name)
            .ToList();

        return Results.Ok(new ProgressDashboardResponse(windowStart, today, completionRate, streaks));
    }
}

public sealed record TodayDashboardResponse(DateOnly Date, IReadOnlyCollection<TodayHabitResponse> Habits);

public sealed record TodayHabitResponse(Guid Id, string Name, string Category, string CueText, bool CompletedToday);

public sealed record ProgressDashboardResponse(
    DateOnly From,
    DateOnly To,
    decimal CompletionRate,
    IReadOnlyCollection<HabitProgressResponse> Habits);

public sealed record HabitProgressResponse(Guid Id, string Name, int CurrentStreak, int LongestStreak);
