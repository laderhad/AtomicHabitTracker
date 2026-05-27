using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.ShareCards;

public sealed class ShareCard
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string Type { get; set; } = ShareCardTypes.Progress;

    public string Title { get; set; } = string.Empty;

    public string Subtitle { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public string DeepLink { get; set; } = string.Empty;

    public string PayloadJson { get; set; } = "{}";

    public DateTimeOffset CreatedAt { get; set; }
}

public static class ShareCardTypes
{
    public const string Progress = "progress";

    public const string Habit = "habit";

    public const string Challenge = "challenge";

    public const string WeeklyReview = "weekly_review";

    public const string Streak = "streak";
}
