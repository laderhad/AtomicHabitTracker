using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Features.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Privacy;

public static class PrivacyEndpoints
{
    public static IEndpointRouteBuilder MapPrivacyEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/privacy")
            .WithTags("Privacy")
            .RequireAuthorization();

        group.MapGet("/export", ExportMyData)
            .WithName("ExportMyPrivacyData");

        group.MapDelete("/account", DeleteMyAccount)
            .WithName("DeleteMyAccount");

        return app;
    }

    private static async Task<IResult> ExportMyData(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        UserManager<ApplicationUser> userManager,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(currentUser.UserId.ToString());
        if (user is null)
        {
            return Results.NotFound();
        }

        var userId = currentUser.UserId;

        var habits = await dbContext.Habits
            .AsNoTracking()
            .Where(habit => habit.UserId == userId)
            .OrderBy(habit => habit.CreatedAt)
            .Select(habit => new
            {
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
                habit.UpdatedAt,
                Streak = habit.Streak == null ? null : new
                {
                    habit.Streak.CurrentStreak,
                    habit.Streak.LongestStreak,
                    habit.Streak.LastCompletedOn,
                    habit.Streak.LastCompletedAt
                },
                Reminder = habit.Reminder == null ? null : new
                {
                    habit.Reminder.Enabled,
                    habit.Reminder.TriggerTime,
                    habit.Reminder.TimeZone,
                    habit.Reminder.Channel,
                    habit.Reminder.DaysOfWeek,
                    habit.Reminder.QuietHoursStart,
                    habit.Reminder.QuietHoursEnd,
                    habit.Reminder.CreatedAt,
                    habit.Reminder.UpdatedAt
                }
            })
            .ToListAsync(cancellationToken);

        var habitIds = habits.Select(habit => habit.Id).ToArray();

        var habitLogs = await dbContext.HabitLogs
            .AsNoTracking()
            .Where(log => habitIds.Contains(log.HabitId))
            .OrderBy(log => log.OccurredAt)
            .Select(log => new
            {
                log.Id,
                log.HabitId,
                log.OccurredAt,
                log.Status,
                log.Value,
                log.Unit,
                log.Note,
                log.Source,
                log.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var weeklyReviews = await dbContext.WeeklyReviews
            .AsNoTracking()
            .Where(review => review.UserId == userId)
            .OrderBy(review => review.WeekStartOn)
            .Select(review => new
            {
                review.Id,
                review.WeekStartOn,
                WeekEndOn = review.WeekStartOn.AddDays(6),
                review.ConsistencyScore,
                review.WhatWorked,
                review.WhatWasHard,
                review.Adjustment,
                review.Mood,
                review.CreatedAt,
                review.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        var challenges = await dbContext.Challenges
            .AsNoTracking()
            .Include(challenge => challenge.Participants)
            .Where(challenge =>
                challenge.CreatedByUserId == userId ||
                challenge.Participants.Any(participant => participant.UserId == userId))
            .OrderBy(challenge => challenge.CreatedAt)
            .Select(challenge => new
            {
                challenge.Id,
                challenge.Title,
                challenge.Description,
                challenge.StartAt,
                challenge.EndAt,
                challenge.Visibility,
                challenge.InviteCode,
                challenge.CreatedByUserId,
                challenge.CreatedAt,
                ParticipantCount = challenge.Participants.Count,
                CurrentUserRole = challenge.Participants
                    .Where(participant => participant.UserId == userId)
                    .Select(participant => participant.Role)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var challengeIds = challenges.Select(challenge => challenge.Id).ToArray();

        var challengeCheckIns = await dbContext.ChallengeCheckIns
            .AsNoTracking()
            .Where(checkIn => checkIn.UserId == userId && challengeIds.Contains(checkIn.ChallengeId))
            .OrderBy(checkIn => checkIn.CreatedAt)
            .Select(checkIn => new
            {
                checkIn.Id,
                checkIn.ChallengeId,
                checkIn.HabitLogId,
                checkIn.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var shareCards = await dbContext.ShareCards
            .AsNoTracking()
            .Where(shareCard => shareCard.UserId == userId)
            .OrderBy(shareCard => shareCard.CreatedAt)
            .Select(shareCard => new
            {
                shareCard.Id,
                shareCard.Type,
                shareCard.Title,
                shareCard.Subtitle,
                shareCard.ImageUrl,
                shareCard.DeepLink,
                shareCard.PayloadJson,
                shareCard.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var badgeUnlocks = await dbContext.BadgeUnlocks
            .AsNoTracking()
            .Where(unlock => unlock.UserId == userId)
            .OrderBy(unlock => unlock.UnlockedAt)
            .Select(unlock => new
            {
                unlock.Id,
                unlock.BadgeCode,
                unlock.UnlockedAt,
                unlock.SeenAt,
                unlock.ContextJson
            })
            .ToListAsync(cancellationToken);

        var devices = await dbContext.Devices
            .AsNoTracking()
            .Where(device => device.UserId == userId)
            .OrderBy(device => device.LastSeenAt)
            .Select(device => new
            {
                device.Id,
                device.Platform,
                device.AuthorizationStatus,
                device.DeviceName,
                device.AppVersion,
                device.TimeZone,
                device.LastSeenAt,
                device.RevokedAt,
                device.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Results.Ok(new
        {
            ExportedAt = DateTimeOffset.UtcNow,
            User = user.ToProfileResponse(),
            Habits = habits,
            HabitLogs = habitLogs,
            WeeklyReviews = weeklyReviews,
            Challenges = challenges,
            ChallengeCheckIns = challengeCheckIns,
            ShareCards = shareCards,
            BadgeUnlocks = badgeUnlocks,
            Devices = devices
        });
    }

    private static async Task<IResult> DeleteMyAccount(
        ICurrentUser currentUser,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(currentUser.UserId.ToString());
        if (user is null)
        {
            return Results.NoContent();
        }

        var result = await userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return Results.ValidationProblem(result.Errors
                .GroupBy(error => error.Code)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.Description).ToArray()));
        }

        return Results.NoContent();
    }
}
