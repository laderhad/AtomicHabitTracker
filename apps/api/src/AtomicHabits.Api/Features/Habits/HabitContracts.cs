using AtomicHabits.Api.Features.HabitLogs;

namespace AtomicHabits.Api.Features.Habits;

public sealed record CreateHabitRequest(
    string Name,
    string? Description,
    string? Category,
    string? IdentityStatement,
    string? CueType,
    string? CueText,
    string? RewardText,
    string? Difficulty,
    bool IsPositive = true);

public sealed record UpdateHabitRequest(
    string? Name,
    string? Description,
    string? Category,
    string? IdentityStatement,
    string? CueType,
    string? CueText,
    string? RewardText,
    string? Difficulty,
    bool? IsPositive);

public sealed record CreateHabitLogRequest(
    string Status,
    DateTimeOffset? OccurredAt,
    decimal? Value,
    string? Unit,
    string? Note,
    string? Source);

public sealed record HabitResponse(
    Guid Id,
    string Name,
    string Description,
    string Category,
    string IdentityStatement,
    string CueType,
    string CueText,
    string RewardText,
    string Difficulty,
    bool IsPositive,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    HabitStreakResponse Streak);

public sealed record HabitLogResponse(
    Guid Id,
    Guid HabitId,
    string Status,
    DateTimeOffset OccurredAt,
    decimal? Value,
    string Unit,
    string Note,
    string Source,
    HabitStreakResponse? Streak);

public sealed record HabitStreakResponse(
    int CurrentStreak,
    int LongestStreak,
    DateOnly? LastCompletedOn);

public static class HabitMapping
{
    public static HabitResponse ToResponse(this Habit habit)
    {
        return new HabitResponse(
            habit.Id,
            habit.Name,
            habit.Description,
            habit.Category,
            habit.IdentityStatement,
            habit.CueType,
            habit.CueText,
            habit.RewardText,
            habit.Difficulty,
            habit.IsPositive,
            habit.IsArchived,
            habit.CreatedAt,
            habit.Streak.ToResponse());
    }

    public static HabitLogResponse ToResponse(this HabitLog log, HabitStreak? streak)
    {
        return new HabitLogResponse(
            log.Id,
            log.HabitId,
            log.Status,
            log.OccurredAt,
            log.Value,
            log.Unit,
            log.Note,
            log.Source,
            streak.ToResponse());
    }

    public static HabitStreakResponse ToResponse(this HabitStreak? streak)
    {
        return new HabitStreakResponse(
            streak?.CurrentStreak ?? 0,
            streak?.LongestStreak ?? 0,
            streak?.LastCompletedOn);
    }
}
