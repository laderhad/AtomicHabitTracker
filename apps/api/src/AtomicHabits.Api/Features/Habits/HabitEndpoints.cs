using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.Gamification;
using AtomicHabits.Api.Features.HabitLogs;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Habits;

public static class HabitEndpoints
{
    public static IEndpointRouteBuilder MapHabitEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/habits")
            .WithTags("Habits")
            .RequireAuthorization();

        group.MapGet("/", ListHabits)
            .WithName("ListHabits");

        group.MapPost("/", CreateHabit)
            .WithName("CreateHabit");

        group.MapGet("/{habitId:guid}", GetHabit)
            .WithName("GetHabit");

        group.MapPatch("/{habitId:guid}", UpdateHabit)
            .WithName("UpdateHabit");

        group.MapDelete("/{habitId:guid}", ArchiveHabit)
            .WithName("ArchiveHabit");

        group.MapPost("/{habitId:guid}/logs", CreateHabitLog)
            .WithName("CreateHabitLog");

        return app;
    }

    private static async Task<IResult> ListHabits(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var habits = await dbContext.Habits
            .AsNoTracking()
            .Include(habit => habit.Streak)
            .Where(habit => habit.UserId == currentUser.UserId && !habit.IsArchived)
            .OrderBy(habit => habit.CreatedAt)
            .ToListAsync(cancellationToken);

        return Results.Ok(habits.Select(habit => habit.ToResponse()));
    }

    private static async Task<IResult> GetHabit(
        Guid habitId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var habit = await dbContext.Habits
            .AsNoTracking()
            .Include(item => item.Streak)
            .FirstOrDefaultAsync(
                item => item.Id == habitId && item.UserId == currentUser.UserId,
                cancellationToken);

        return habit is null ? Results.NotFound() : Results.Ok(habit.ToResponse());
    }

    private static async Task<IResult> CreateHabit(
        CreateHabitRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { error = "Habit name is required." });
        }

        var habit = new Habit
        {
            UserId = currentUser.UserId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Category = Normalize(request.Category, "general"),
            IdentityStatement = request.IdentityStatement?.Trim() ?? string.Empty,
            CueType = Normalize(request.CueType, "time"),
            CueText = request.CueText?.Trim() ?? string.Empty,
            RewardText = request.RewardText?.Trim() ?? string.Empty,
            Difficulty = Normalize(request.Difficulty, "easy"),
            IsPositive = request.IsPositive,
            CreatedAt = clock.UtcNow
        };

        habit.Streak = new HabitStreak
        {
            HabitId = habit.Id
        };

        dbContext.Habits.Add(habit);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstHabit, new { habitId = habit.Id })],
            cancellationToken);

        return Results.Created($"/api/v1/habits/{habit.Id}", habit.ToResponse());
    }

    private static async Task<IResult> UpdateHabit(
        Guid habitId,
        UpdateHabitRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var habit = await dbContext.Habits
            .Include(item => item.Streak)
            .FirstOrDefaultAsync(
                item => item.Id == habitId && item.UserId == currentUser.UserId,
                cancellationToken);

        if (habit is null)
        {
            return Results.NotFound();
        }

        if (request.Name is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return Results.BadRequest(new { error = "Habit name cannot be empty." });
            }

            habit.Name = request.Name.Trim();
        }

        habit.Description = request.Description?.Trim() ?? habit.Description;
        habit.Category = request.Category is null ? habit.Category : Normalize(request.Category, habit.Category);
        habit.IdentityStatement = request.IdentityStatement?.Trim() ?? habit.IdentityStatement;
        habit.CueType = request.CueType is null ? habit.CueType : Normalize(request.CueType, habit.CueType);
        habit.CueText = request.CueText?.Trim() ?? habit.CueText;
        habit.RewardText = request.RewardText?.Trim() ?? habit.RewardText;
        habit.Difficulty = request.Difficulty is null ? habit.Difficulty : Normalize(request.Difficulty, habit.Difficulty);
        habit.IsPositive = request.IsPositive ?? habit.IsPositive;
        habit.UpdatedAt = clock.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Ok(habit.ToResponse());
    }

    private static async Task<IResult> ArchiveHabit(
        Guid habitId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var habit = await dbContext.Habits
            .FirstOrDefaultAsync(
                item => item.Id == habitId && item.UserId == currentUser.UserId,
                cancellationToken);

        if (habit is null)
        {
            return Results.NotFound();
        }

        habit.IsArchived = true;
        habit.UpdatedAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> CreateHabitLog(
        Guid habitId,
        CreateHabitLogRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var habit = await dbContext.Habits
            .Include(item => item.Streak)
            .FirstOrDefaultAsync(
                item => item.Id == habitId && item.UserId == currentUser.UserId && !item.IsArchived,
                cancellationToken);

        if (habit is null)
        {
            return Results.NotFound();
        }

        var occurredAt = request.OccurredAt ?? clock.UtcNow;
        var occurredOn = DateOnly.FromDateTime(occurredAt.Date);
        var occurredAtUtc = occurredAt.ToUniversalTime();
        var status = Normalize(request.Status, HabitLogStatuses.Completed);

        var log = new HabitLog
        {
            HabitId = habit.Id,
            OccurredAt = occurredAtUtc,
            Status = status,
            Value = request.Value,
            Unit = request.Unit?.Trim() ?? string.Empty,
            Note = request.Note?.Trim() ?? string.Empty,
            Source = Normalize(request.Source, "manual"),
            CreatedAt = clock.UtcNow
        };

        habit.Streak ??= new HabitStreak { HabitId = habit.Id };

        if (string.Equals(status, HabitLogStatuses.Completed, StringComparison.OrdinalIgnoreCase))
        {
            var result = StreakCalculator.ApplyCompletion(
                habit.Streak.LastCompletedOn,
                habit.Streak.CurrentStreak,
                habit.Streak.LongestStreak,
                occurredOn);

            habit.Streak.CurrentStreak = result.CurrentStreak;
            habit.Streak.LongestStreak = result.LongestStreak;
            habit.Streak.LastCompletedOn = occurredOn;
            habit.Streak.LastCompletedAt = occurredAtUtc;
        }

        dbContext.HabitLogs.Add(log);
        await dbContext.SaveChangesAsync(cancellationToken);

        if (string.Equals(status, HabitLogStatuses.Completed, StringComparison.OrdinalIgnoreCase))
        {
            var userHabitIds = await dbContext.Habits
                .AsNoTracking()
                .Where(item => item.UserId == currentUser.UserId)
                .Select(item => item.Id)
                .ToListAsync(cancellationToken);

            var completedCheckIns = await dbContext.HabitLogs
                .AsNoTracking()
                .Where(item =>
                    userHabitIds.Contains(item.HabitId) &&
                    item.Status == HabitLogStatuses.Completed)
                .CountAsync(cancellationToken);

            var awards = new List<BadgeAward>
            {
                new(BadgeCodes.FirstCheckIn, new { habitId = habit.Id })
            };

            if (habit.Streak.CurrentStreak >= 3)
            {
                awards.Add(new BadgeAward(BadgeCodes.ThreeDayStreak, new
                {
                    habitId = habit.Id,
                    streak = habit.Streak.CurrentStreak
                }));
            }

            if (habit.Streak.CurrentStreak >= 7)
            {
                awards.Add(new BadgeAward(BadgeCodes.SevenDayStreak, new
                {
                    habitId = habit.Id,
                    streak = habit.Streak.CurrentStreak
                }));
            }

            if (completedCheckIns >= 10)
            {
                awards.Add(new BadgeAward(BadgeCodes.TenCheckIns, new { count = completedCheckIns }));
            }

            await badgeAwarder.AwardAsync(currentUser.UserId, awards, cancellationToken);
        }

        return Results.Created(
            $"/api/v1/habits/{habit.Id}/logs/{log.Id}",
            log.ToResponse(habit.Streak));
    }

    private static string Normalize(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value)
            ? fallback
            : value.Trim().ToLowerInvariant();
    }
}
