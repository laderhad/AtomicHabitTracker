using AtomicHabits.Api.Features.Habits;

namespace AtomicHabits.Api.Tests;

public sealed class StreakCalculatorTests
{
    [Fact]
    public void ApplyCompletion_starts_new_streak_when_there_is_no_previous_completion()
    {
        var result = StreakCalculator.ApplyCompletion(null, 0, 0, new DateOnly(2026, 6, 1));

        Assert.Equal(1, result.CurrentStreak);
        Assert.Equal(1, result.LongestStreak);
    }

    [Fact]
    public void ApplyCompletion_extends_streak_for_consecutive_day()
    {
        var result = StreakCalculator.ApplyCompletion(
            new DateOnly(2026, 6, 1),
            currentStreak: 3,
            longestStreak: 5,
            completedOn: new DateOnly(2026, 6, 2));

        Assert.Equal(4, result.CurrentStreak);
        Assert.Equal(5, result.LongestStreak);
    }

    [Fact]
    public void ApplyCompletion_does_not_double_count_same_day()
    {
        var result = StreakCalculator.ApplyCompletion(
            new DateOnly(2026, 6, 1),
            currentStreak: 3,
            longestStreak: 3,
            completedOn: new DateOnly(2026, 6, 1));

        Assert.Equal(3, result.CurrentStreak);
        Assert.Equal(3, result.LongestStreak);
    }
}
