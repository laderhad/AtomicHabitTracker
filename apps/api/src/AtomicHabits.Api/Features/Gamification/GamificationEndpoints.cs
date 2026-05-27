using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Gamification;

public static class GamificationEndpoints
{
    private const int DefaultNotificationLimit = 5;
    private const int MaxNotificationLimit = 25;

    public static IEndpointRouteBuilder MapGamificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/gamification")
            .WithTags("Gamification")
            .RequireAuthorization();

        group.MapGet("/badges", ListBadges)
            .WithName("ListBadges");

        group.MapGet("/summary", GetSummary)
            .WithName("GetGamificationSummary");

        group.MapGet("/unlocks", ListUnlocks)
            .WithName("ListBadgeUnlocks");

        group.MapGet("/notifications", ListNotifications)
            .WithName("ListBadgeUnlockNotifications");

        group.MapPost("/unlocks/mark-seen", MarkUnlocksSeen)
            .WithName("MarkBadgeUnlocksSeen");

        return app;
    }

    private static async Task<IResult> ListBadges(
        string? culture,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var resolvedCulture = await ResolveCultureAsync(culture, dbContext, currentUser.UserId, cancellationToken);
        var badges = BadgeCatalog.All
            .OrderBy(badge => badge.SortOrder)
            .Select(badge => badge.ToResponse(resolvedCulture))
            .ToList();

        return Results.Ok(badges);
    }

    private static async Task<IResult> GetSummary(
        string? culture,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var resolvedCulture = await ResolveCultureAsync(culture, dbContext, currentUser.UserId, cancellationToken);
        var unlocks = await dbContext.BadgeUnlocks
            .AsNoTracking()
            .Where(unlock => unlock.UserId == currentUser.UserId)
            .OrderByDescending(unlock => unlock.UnlockedAt)
            .ToListAsync(cancellationToken);

        var unlocksByCode = unlocks
            .GroupBy(unlock => unlock.BadgeCode)
            .ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal);

        var badges = BadgeCatalog.All
            .OrderBy(badge => badge.SortOrder)
            .Select(badge =>
            {
                unlocksByCode.TryGetValue(badge.Code, out var unlock);
                return badge.ToProgressResponse(unlock, resolvedCulture);
            })
            .ToList();

        var recentUnlocks = unlocks
            .Take(5)
            .Select(unlock => unlock.ToResponse())
            .ToList();

        return Results.Ok(new GamificationSummaryResponse(
            BadgeCatalog.All.Count,
            unlocksByCode.Count,
            unlocks.Count(unlock => unlock.SeenAt is null),
            badges,
            recentUnlocks));
    }

    private static async Task<IResult> ListUnlocks(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var unlocks = await dbContext.BadgeUnlocks
            .AsNoTracking()
            .Where(unlock => unlock.UserId == currentUser.UserId)
            .OrderByDescending(unlock => unlock.UnlockedAt)
            .Select(unlock => unlock.ToResponse())
            .ToListAsync(cancellationToken);

        return Results.Ok(unlocks);
    }

    private static async Task<IResult> ListNotifications(
        string? culture,
        int? limit,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var resolvedCulture = await ResolveCultureAsync(culture, dbContext, currentUser.UserId, cancellationToken);
        var take = Math.Clamp(limit ?? DefaultNotificationLimit, 1, MaxNotificationLimit);

        var unlocks = await dbContext.BadgeUnlocks
            .AsNoTracking()
            .Where(unlock => unlock.UserId == currentUser.UserId && unlock.SeenAt == null)
            .OrderByDescending(unlock => unlock.UnlockedAt)
            .Take(take)
            .ToListAsync(cancellationToken);

        var notifications = unlocks
            .Select(unlock => unlock.ToNotificationResponse(resolvedCulture))
            .OfType<BadgeUnlockNotificationResponse>()
            .ToList();

        return Results.Ok(notifications);
    }

    private static async Task<IResult> MarkUnlocksSeen(
        MarkBadgeUnlocksSeenRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var query = dbContext.BadgeUnlocks
            .Where(unlock => unlock.UserId == currentUser.UserId && unlock.SeenAt == null);

        if (request.UnlockIds is { Count: > 0 })
        {
            var unlockIds = request.UnlockIds.Distinct().ToArray();
            query = query.Where(unlock => unlockIds.Contains(unlock.Id));
        }

        var unlocks = await query.ToListAsync(cancellationToken);
        if (unlocks.Count == 0)
        {
            return Results.Ok(new MarkBadgeUnlocksSeenResponse(0, clock.UtcNow));
        }

        var seenAt = clock.UtcNow;
        foreach (var unlock in unlocks)
        {
            unlock.SeenAt = seenAt;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Ok(new MarkBadgeUnlocksSeenResponse(unlocks.Count, seenAt));
    }

    private static async Task<string> ResolveCultureAsync(
        string? culture,
        AtomicHabitsDbContext dbContext,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(culture))
        {
            return BadgeCatalog.ResolveCulture(culture, preferredCulture: null);
        }

        var preferredCulture = await dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => user.PreferredLanguage)
            .FirstOrDefaultAsync(cancellationToken);

        return BadgeCatalog.ResolveCulture(culture, preferredCulture);
    }
}
