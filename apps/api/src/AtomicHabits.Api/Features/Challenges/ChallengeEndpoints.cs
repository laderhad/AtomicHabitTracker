using System.Security.Cryptography;
using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.Gamification;
using AtomicHabits.Api.Features.HabitLogs;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Challenges;

public static class ChallengeEndpoints
{
    private static readonly HashSet<string> SupportedVisibility =
    [
        ChallengeVisibility.Private,
        ChallengeVisibility.InviteOnly,
        ChallengeVisibility.Public
    ];

    public static IEndpointRouteBuilder MapChallengeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/challenges")
            .WithTags("Challenges")
            .RequireAuthorization();

        group.MapGet("/", ListChallenges)
            .WithName("ListChallenges");

        group.MapPost("/", CreateChallenge)
            .WithName("CreateChallenge");

        group.MapGet("/{challengeId:guid}", GetChallenge)
            .WithName("GetChallenge");

        group.MapGet("/{challengeId:guid}/participants", ListParticipants)
            .WithName("ListChallengeParticipants");

        group.MapPost("/{challengeId:guid}/join", JoinChallenge)
            .WithName("JoinChallenge");

        group.MapPost("/{challengeId:guid}/check-ins", CreateCheckIn)
            .WithName("CreateChallengeCheckIn");

        return app;
    }

    private static async Task<IResult> ListChallenges(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var challenges = await dbContext.Challenges
            .AsNoTracking()
            .Include(challenge => challenge.Participants)
            .Where(challenge =>
                challenge.Visibility == ChallengeVisibility.Public ||
                challenge.Participants.Any(participant => participant.UserId == currentUser.UserId))
            .OrderByDescending(challenge => challenge.CreatedAt)
            .ToListAsync(cancellationToken);

        return Results.Ok(challenges.Select(challenge => challenge.ToResponse(currentUser.UserId)));
    }

    private static async Task<IResult> GetChallenge(
        Guid challengeId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var challenge = await dbContext.Challenges
            .AsNoTracking()
            .Include(item => item.Participants)
            .FirstOrDefaultAsync(item => item.Id == challengeId, cancellationToken);

        if (challenge is null || !CanView(challenge, currentUser.UserId))
        {
            return Results.NotFound();
        }

        return Results.Ok(challenge.ToResponse(currentUser.UserId));
    }

    private static async Task<IResult> CreateChallenge(
        CreateChallengeRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        if (!TryNormalizeText(request.Title, 120, out var title, out var error) ||
            !TryNormalizeText(request.Description, 600, out var description, out error))
        {
            return Results.BadRequest(new { error });
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            return Results.BadRequest(new { error = "title is required." });
        }

        if (request.EndAt <= request.StartAt)
        {
            return Results.BadRequest(new { error = "endAt must be after startAt." });
        }

        var visibility = Normalize(request.Visibility, ChallengeVisibility.InviteOnly);
        if (!SupportedVisibility.Contains(visibility))
        {
            return Results.BadRequest(new { error = "visibility must be private, invite_only, or public." });
        }

        var now = clock.UtcNow;
        var challenge = new Challenge
        {
            CreatedByUserId = currentUser.UserId,
            Title = title,
            Description = description,
            StartAt = request.StartAt.ToUniversalTime(),
            EndAt = request.EndAt.ToUniversalTime(),
            Visibility = visibility,
            InviteCode = GenerateInviteCode(),
            CreatedAt = now
        };

        challenge.Participants.Add(new ChallengeParticipant
        {
            ChallengeId = challenge.Id,
            UserId = currentUser.UserId,
            Role = ChallengeParticipantRoles.Owner,
            JoinedAt = now
        });

        dbContext.Challenges.Add(challenge);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstChallenge, new { challengeId = challenge.Id })],
            cancellationToken);

        return Results.Created($"/api/v1/challenges/{challenge.Id}", challenge.ToResponse(currentUser.UserId));
    }

    private static async Task<IResult> ListParticipants(
        Guid challengeId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var challenge = await dbContext.Challenges
            .AsNoTracking()
            .Include(item => item.Participants)
            .FirstOrDefaultAsync(item => item.Id == challengeId, cancellationToken);

        if (challenge is null || !CanView(challenge, currentUser.UserId))
        {
            return Results.NotFound();
        }

        return Results.Ok(challenge.Participants
            .OrderBy(participant => participant.JoinedAt)
            .Select(participant => participant.ToResponse()));
    }

    private static async Task<IResult> JoinChallenge(
        Guid challengeId,
        JoinChallengeRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var challenge = await dbContext.Challenges
            .Include(item => item.Participants)
            .FirstOrDefaultAsync(item => item.Id == challengeId, cancellationToken);

        if (challenge is null)
        {
            return Results.NotFound();
        }

        if (challenge.EndAt < clock.UtcNow)
        {
            return Results.BadRequest(new { error = "challenge has ended." });
        }

        var existingParticipant = challenge.Participants
            .FirstOrDefault(participant => participant.UserId == currentUser.UserId);

        if (existingParticipant is not null)
        {
            await badgeAwarder.AwardAsync(
                currentUser.UserId,
                [new BadgeAward(BadgeCodes.FirstChallenge, new { challengeId = challenge.Id })],
                cancellationToken);

            return Results.Ok(challenge.ToResponse(currentUser.UserId));
        }

        if (!CanJoin(challenge, request.InviteCode))
        {
            return Results.BadRequest(new { error = "inviteCode is required for this challenge." });
        }

        var participant = new ChallengeParticipant
        {
            ChallengeId = challenge.Id,
            UserId = currentUser.UserId,
            Role = ChallengeParticipantRoles.Member,
            JoinedAt = clock.UtcNow
        };

        dbContext.ChallengeParticipants.Add(participant);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstChallenge, new { challengeId = challenge.Id })],
            cancellationToken);

        var joinedChallenge = await dbContext.Challenges
            .AsNoTracking()
            .Include(item => item.Participants)
            .FirstAsync(item => item.Id == challengeId, cancellationToken);

        return Results.Ok(joinedChallenge.ToResponse(currentUser.UserId));
    }

    private static async Task<IResult> CreateCheckIn(
        Guid challengeId,
        CreateChallengeCheckInRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var isParticipant = await dbContext.ChallengeParticipants
            .AnyAsync(
                participant => participant.ChallengeId == challengeId && participant.UserId == currentUser.UserId,
                cancellationToken);

        if (!isParticipant)
        {
            return Results.NotFound();
        }

        var habitLog = await dbContext.HabitLogs
            .AsNoTracking()
            .Include(log => log.Habit)
            .FirstOrDefaultAsync(
                log =>
                    log.Id == request.HabitLogId &&
                    log.Habit != null &&
                    log.Habit.UserId == currentUser.UserId,
                cancellationToken);

        if (habitLog is null)
        {
            return Results.BadRequest(new { error = "habitLogId is invalid." });
        }

        if (!string.Equals(habitLog.Status, HabitLogStatuses.Completed, StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new { error = "habitLogId must reference a completed log." });
        }

        var existingCheckIn = await dbContext.ChallengeCheckIns
            .FirstOrDefaultAsync(
                checkIn => checkIn.ChallengeId == challengeId && checkIn.HabitLogId == request.HabitLogId,
                cancellationToken);

        if (existingCheckIn is not null)
        {
            await badgeAwarder.AwardAsync(
                currentUser.UserId,
                [new BadgeAward(BadgeCodes.FirstChallengeCheckIn, new { challengeId, habitLogId = request.HabitLogId })],
                cancellationToken);

            return Results.Ok(existingCheckIn.ToResponse());
        }

        var checkIn = new ChallengeCheckIn
        {
            ChallengeId = challengeId,
            UserId = currentUser.UserId,
            HabitLogId = request.HabitLogId,
            CreatedAt = clock.UtcNow
        };

        dbContext.ChallengeCheckIns.Add(checkIn);
        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstChallengeCheckIn, new { challengeId, habitLogId = request.HabitLogId })],
            cancellationToken);

        return Results.Created($"/api/v1/challenges/{challengeId}/check-ins/{checkIn.Id}", checkIn.ToResponse());
    }

    private static bool CanView(Challenge challenge, Guid currentUserId)
    {
        return challenge.Visibility == ChallengeVisibility.Public ||
            challenge.Participants.Any(participant => participant.UserId == currentUserId);
    }

    private static bool CanJoin(Challenge challenge, string? inviteCode)
    {
        if (challenge.Visibility == ChallengeVisibility.Public)
        {
            return true;
        }

        return string.Equals(
            challenge.InviteCode,
            inviteCode?.Trim(),
            StringComparison.OrdinalIgnoreCase);
    }

    private static string GenerateInviteCode()
    {
        return Convert.ToHexString(RandomNumberGenerator.GetBytes(5));
    }

    private static string Normalize(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value)
            ? fallback
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
