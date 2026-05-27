namespace AtomicHabits.Api.Features.Gamification;

public sealed record BadgeResponse(
    string Code,
    string Category,
    int SortOrder,
    string Title,
    string Description);

public sealed record BadgeUnlockResponse(
    Guid Id,
    string BadgeCode,
    DateTimeOffset UnlockedAt,
    DateTimeOffset? SeenAt,
    string ContextJson);

public sealed record BadgeUnlockNotificationResponse(
    Guid UnlockId,
    string BadgeCode,
    string Category,
    string Title,
    string Description,
    DateTimeOffset UnlockedAt,
    string ContextJson);

public sealed record MarkBadgeUnlocksSeenRequest(IReadOnlyCollection<Guid>? UnlockIds);

public sealed record MarkBadgeUnlocksSeenResponse(int MarkedCount, DateTimeOffset SeenAt);

public sealed record BadgeProgressResponse(
    string Code,
    string Category,
    int SortOrder,
    string Title,
    string Description,
    bool IsUnlocked,
    DateTimeOffset? UnlockedAt);

public sealed record GamificationSummaryResponse(
    int TotalBadgeCount,
    int UnlockedBadgeCount,
    int UnseenUnlockCount,
    IReadOnlyCollection<BadgeProgressResponse> Badges,
    IReadOnlyCollection<BadgeUnlockResponse> RecentUnlocks);

public static class GamificationMapping
{
    public static BadgeResponse ToResponse(this BadgeDefinition badge, string culture)
    {
        return new BadgeResponse(
            badge.Code,
            badge.Category,
            badge.SortOrder,
            LocalizedTitle(badge, culture),
            LocalizedDescription(badge, culture));
    }

    public static BadgeProgressResponse ToProgressResponse(
        this BadgeDefinition badge,
        BadgeUnlock? unlock,
        string culture)
    {
        return new BadgeProgressResponse(
            badge.Code,
            badge.Category,
            badge.SortOrder,
            LocalizedTitle(badge, culture),
            LocalizedDescription(badge, culture),
            unlock is not null,
            unlock?.UnlockedAt);
    }

    public static BadgeUnlockResponse ToResponse(this BadgeUnlock unlock)
    {
        return new BadgeUnlockResponse(
            unlock.Id,
            unlock.BadgeCode,
            unlock.UnlockedAt,
            unlock.SeenAt,
            unlock.ContextJson);
    }

    public static BadgeUnlockNotificationResponse? ToNotificationResponse(
        this BadgeUnlock unlock,
        string culture)
    {
        var badge = BadgeCatalog.Find(unlock.BadgeCode);
        if (badge is null)
        {
            return null;
        }

        return new BadgeUnlockNotificationResponse(
            unlock.Id,
            unlock.BadgeCode,
            badge.Category,
            LocalizedTitle(badge, culture),
            LocalizedDescription(badge, culture),
            unlock.UnlockedAt,
            unlock.ContextJson);
    }

    private static string LocalizedTitle(BadgeDefinition badge, string culture)
    {
        return culture == BadgeCatalog.TurkishCulture ? badge.TitleTr : badge.TitleEn;
    }

    private static string LocalizedDescription(BadgeDefinition badge, string culture)
    {
        return culture == BadgeCatalog.TurkishCulture ? badge.DescriptionTr : badge.DescriptionEn;
    }
}
