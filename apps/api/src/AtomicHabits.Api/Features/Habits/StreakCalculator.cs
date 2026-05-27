namespace AtomicHabits.Api.Features.Habits;

public static class StreakCalculator
{
    public static StreakResult ApplyCompletion(
        DateOnly? lastCompletedOn,
        int currentStreak,
        int longestStreak,
        DateOnly completedOn)
    {
        if (lastCompletedOn == completedOn)
        {
            return new StreakResult(currentStreak, Math.Max(longestStreak, currentStreak));
        }

        var nextCurrentStreak = lastCompletedOn == completedOn.AddDays(-1)
            ? currentStreak + 1
            : 1;

        return new StreakResult(nextCurrentStreak, Math.Max(longestStreak, nextCurrentStreak));
    }
}

public readonly record struct StreakResult(int CurrentStreak, int LongestStreak);
