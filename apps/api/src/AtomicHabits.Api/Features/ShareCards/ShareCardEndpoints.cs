using System.Text.Json;
using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.Challenges;
using AtomicHabits.Api.Features.Gamification;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.ShareCards;

public static class ShareCardEndpoints
{
    private static readonly HashSet<string> SupportedTypes =
    [
        ShareCardTypes.Progress,
        ShareCardTypes.Habit,
        ShareCardTypes.Challenge,
        ShareCardTypes.WeeklyReview,
        ShareCardTypes.Streak
    ];

    public static IEndpointRouteBuilder MapShareCardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/share-cards")
            .WithTags("Share Cards")
            .RequireAuthorization();

        group.MapGet("/", ListShareCards)
            .WithName("ListShareCards");

        group.MapPost("/", CreateShareCard)
            .WithName("CreateShareCard");

        group.MapGet("/{shareCardId:guid}", GetShareCard)
            .WithName("GetShareCard");

        return app;
    }

    private static async Task<IResult> ListShareCards(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var shareCards = await dbContext.ShareCards
            .AsNoTracking()
            .Where(shareCard => shareCard.UserId == currentUser.UserId)
            .OrderByDescending(shareCard => shareCard.CreatedAt)
            .Select(shareCard => shareCard.ToResponse())
            .ToListAsync(cancellationToken);

        return Results.Ok(shareCards);
    }

    private static async Task<IResult> GetShareCard(
        Guid shareCardId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var shareCard = await dbContext.ShareCards
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.Id == shareCardId && item.UserId == currentUser.UserId,
                cancellationToken);

        return shareCard is null ? Results.NotFound() : Results.Ok(shareCard.ToResponse());
    }

    private static async Task<IResult> CreateShareCard(
        CreateShareCardRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var type = Normalize(request.Type);
        if (!SupportedTypes.Contains(type))
        {
            return Results.BadRequest(new { error = "type is invalid." });
        }

        if (!TryNormalizeText(request.Title, 120, out var title, out var error) ||
            !TryNormalizeText(request.Subtitle, 240, out var subtitle, out error))
        {
            return Results.BadRequest(new { error });
        }

        var targetType = Normalize(string.IsNullOrWhiteSpace(request.TargetType) ? type : request.TargetType);
        if (!SupportedTypes.Contains(targetType))
        {
            return Results.BadRequest(new { error = "targetType is invalid." });
        }

        var targetId = request.TargetId;

        var targetValidation = await ValidateTargetAsync(
            targetType,
            targetId,
            dbContext,
            currentUser.UserId,
            cancellationToken);

        if (!targetValidation.IsValid)
        {
            return Results.BadRequest(new { error = targetValidation.Error });
        }

        var shareCard = new ShareCard
        {
            UserId = currentUser.UserId,
            Type = type,
            Title = string.IsNullOrWhiteSpace(title) ? DefaultTitle(type) : title,
            Subtitle = string.IsNullOrWhiteSpace(subtitle) ? DefaultSubtitle(type) : subtitle,
            CreatedAt = clock.UtcNow
        };

        shareCard.DeepLink = BuildDeepLink(type, targetType, targetId, shareCard.Id);
        shareCard.ImageUrl = string.Empty;
        shareCard.PayloadJson = JsonSerializer.Serialize(new
        {
            targetType,
            targetId
        });

        dbContext.ShareCards.Add(shareCard);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstShareCard, new
            {
                shareCardId = shareCard.Id,
                targetType,
                targetId
            })],
            cancellationToken);

        return Results.Created($"/api/v1/share-cards/{shareCard.Id}", shareCard.ToResponse());
    }

    private static async Task<(bool IsValid, string Error)> ValidateTargetAsync(
        string targetType,
        Guid? targetId,
        AtomicHabitsDbContext dbContext,
        Guid currentUserId,
        CancellationToken cancellationToken)
    {
        if (targetType == ShareCardTypes.Habit)
        {
            if (targetId is null)
            {
                return (false, "targetId is required for habit share cards.");
            }

            var habitExists = await dbContext.Habits
                .AsNoTracking()
                .AnyAsync(
                    habit => habit.Id == targetId && habit.UserId == currentUserId && !habit.IsArchived,
                    cancellationToken);

            return habitExists ? (true, string.Empty) : (false, "targetId is invalid.");
        }

        if (targetType == ShareCardTypes.Challenge)
        {
            if (targetId is null)
            {
                return (false, "targetId is required for challenge share cards.");
            }

            var isParticipant = await dbContext.ChallengeParticipants
                .AsNoTracking()
                .AnyAsync(
                    participant => participant.ChallengeId == targetId && participant.UserId == currentUserId,
                    cancellationToken);

            return isParticipant ? (true, string.Empty) : (false, "targetId is invalid.");
        }

        return (true, string.Empty);
    }

    private static string BuildDeepLink(string type, string targetType, Guid? targetId, Guid shareCardId)
    {
        if (targetType == ShareCardTypes.Habit && targetId is not null)
        {
            return $"atomichabits://habits/{targetId}";
        }

        if (targetType == ShareCardTypes.Challenge && targetId is not null)
        {
            return $"atomichabits://challenges/{targetId}";
        }

        return type switch
        {
            ShareCardTypes.WeeklyReview => "atomichabits://reviews/weekly",
            ShareCardTypes.Streak => "atomichabits://progress/streaks",
            ShareCardTypes.Progress => "atomichabits://progress",
            _ => $"atomichabits://share-cards/{shareCardId}"
        };
    }

    private static string DefaultTitle(string type)
    {
        return type switch
        {
            ShareCardTypes.Challenge => "Join my challenge",
            ShareCardTypes.Habit => "Habit progress",
            ShareCardTypes.WeeklyReview => "Weekly review",
            ShareCardTypes.Streak => "Streak milestone",
            _ => "Weekly progress"
        };
    }

    private static string DefaultSubtitle(string type)
    {
        return type switch
        {
            ShareCardTypes.Challenge => "Small steps, together.",
            ShareCardTypes.Habit => "One check-in at a time.",
            ShareCardTypes.WeeklyReview => "What worked, what changes next.",
            ShareCardTypes.Streak => "Consistency is compounding.",
            _ => "A small system is moving."
        };
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLowerInvariant();
    }

    private static bool TryNormalizeText(
        string? value,
        int maxLength,
        out string normalized,
        out string error)
    {
        normalized = value?.Trim() ?? string.Empty;

        if (normalized.Length <= maxLength)
        {
            error = string.Empty;
            return true;
        }

        error = $"Text fields must be {maxLength} characters or fewer.";
        return false;
    }
}
