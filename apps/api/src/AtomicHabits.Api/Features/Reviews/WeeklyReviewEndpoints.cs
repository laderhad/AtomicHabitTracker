using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using AtomicHabits.Api.Features.Gamification;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Reviews;

public static class WeeklyReviewEndpoints
{
    public static IEndpointRouteBuilder MapWeeklyReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/reviews/weekly")
            .WithTags("Weekly Reviews")
            .RequireAuthorization();

        group.MapGet("/", ListReviews)
            .WithName("ListWeeklyReviews");

        group.MapGet("/current", GetCurrentReview)
            .WithName("GetCurrentWeeklyReview");

        group.MapGet("/{weekStartOn}", GetReview)
            .WithName("GetWeeklyReview");

        group.MapPut("/{weekStartOn}", UpsertReview)
            .WithName("UpsertWeeklyReview");

        group.MapDelete("/{weekStartOn}", DeleteReview)
            .WithName("DeleteWeeklyReview");

        return app;
    }

    private static async Task<IResult> ListReviews(
        string? from,
        string? to,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (!TryParseOptionalDate(from, out var fromDate))
        {
            return Results.BadRequest(new { error = "from must use yyyy-MM-dd format." });
        }

        if (!TryParseOptionalDate(to, out var toDate))
        {
            return Results.BadRequest(new { error = "to must use yyyy-MM-dd format." });
        }

        var query = dbContext.WeeklyReviews
            .AsNoTracking()
            .Where(review => review.UserId == currentUser.UserId);

        if (fromDate is not null)
        {
            query = query.Where(review => review.WeekStartOn >= fromDate);
        }

        if (toDate is not null)
        {
            query = query.Where(review => review.WeekStartOn <= toDate);
        }

        var reviews = await query
            .OrderByDescending(review => review.WeekStartOn)
            .ToListAsync(cancellationToken);

        return Results.Ok(reviews.Select(review => review.ToResponse()));
    }

    private static async Task<IResult> GetCurrentReview(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        var weekStartOn = GetWeekStart(DateOnly.FromDateTime(clock.UtcNow.UtcDateTime));
        var review = await dbContext.WeeklyReviews
            .AsNoTracking()
            .FirstOrDefaultAsync(
                review => review.UserId == currentUser.UserId && review.WeekStartOn == weekStartOn,
                cancellationToken);

        return review is null
            ? Results.Ok(new CurrentWeeklyReviewResponse(weekStartOn, weekStartOn.AddDays(6), null))
            : Results.Ok(new CurrentWeeklyReviewResponse(weekStartOn, weekStartOn.AddDays(6), review.ToResponse()));
    }

    private static async Task<IResult> GetReview(
        string weekStartOn,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (!TryParseWeekStart(weekStartOn, out var parsedWeekStart, out var error))
        {
            return Results.BadRequest(new { error });
        }

        var review = await dbContext.WeeklyReviews
            .AsNoTracking()
            .FirstOrDefaultAsync(
                review => review.UserId == currentUser.UserId && review.WeekStartOn == parsedWeekStart,
                cancellationToken);

        return review is null ? Results.NotFound() : Results.Ok(review.ToResponse());
    }

    private static async Task<IResult> UpsertReview(
        string weekStartOn,
        UpsertWeeklyReviewRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        IBadgeAwarder badgeAwarder,
        CancellationToken cancellationToken)
    {
        if (!TryParseWeekStart(weekStartOn, out var parsedWeekStart, out var error))
        {
            return Results.BadRequest(new { error });
        }

        if (request.ConsistencyScore is < 0 or > 100)
        {
            return Results.BadRequest(new { error = "consistencyScore must be between 0 and 100." });
        }

        if (!TryNormalizeText(request.WhatWorked, 1000, out var whatWorked, out error) ||
            !TryNormalizeText(request.WhatWasHard, 1000, out var whatWasHard, out error) ||
            !TryNormalizeText(request.Adjustment, 1000, out var adjustment, out error) ||
            !TryNormalizeText(request.Mood, 64, out var mood, out error))
        {
            return Results.BadRequest(new { error });
        }

        var now = clock.UtcNow;
        var review = await dbContext.WeeklyReviews
            .FirstOrDefaultAsync(
                review => review.UserId == currentUser.UserId && review.WeekStartOn == parsedWeekStart,
                cancellationToken);

        if (review is null)
        {
            review = new WeeklyReview
            {
                UserId = currentUser.UserId,
                WeekStartOn = parsedWeekStart,
                CreatedAt = now
            };

            dbContext.WeeklyReviews.Add(review);
        }

        review.ConsistencyScore = request.ConsistencyScore;
        review.WhatWorked = whatWorked;
        review.WhatWasHard = whatWasHard;
        review.Adjustment = adjustment;
        review.Mood = mood;
        review.UpdatedAt = now;

        await dbContext.SaveChangesAsync(cancellationToken);
        await badgeAwarder.AwardAsync(
            currentUser.UserId,
            [new BadgeAward(BadgeCodes.FirstWeeklyReview, new { weekStartOn = parsedWeekStart })],
            cancellationToken);

        return Results.Ok(review.ToResponse());
    }

    private static async Task<IResult> DeleteReview(
        string weekStartOn,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        if (!TryParseWeekStart(weekStartOn, out var parsedWeekStart, out var error))
        {
            return Results.BadRequest(new { error });
        }

        var review = await dbContext.WeeklyReviews
            .FirstOrDefaultAsync(
                review => review.UserId == currentUser.UserId && review.WeekStartOn == parsedWeekStart,
                cancellationToken);

        if (review is null)
        {
            return Results.NoContent();
        }

        dbContext.WeeklyReviews.Remove(review);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static bool TryParseWeekStart(
        string value,
        out DateOnly weekStartOn,
        out string error)
    {
        if (!DateOnly.TryParseExact(value, "yyyy-MM-dd", out weekStartOn))
        {
            error = "weekStartOn must use yyyy-MM-dd format.";
            return false;
        }

        if (weekStartOn.DayOfWeek != DayOfWeek.Monday)
        {
            error = "weekStartOn must be a Monday.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    private static bool TryParseOptionalDate(string? value, out DateOnly? date)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            date = null;
            return true;
        }

        if (DateOnly.TryParseExact(value, "yyyy-MM-dd", out var parsed))
        {
            date = parsed;
            return true;
        }

        date = null;
        return false;
    }

    private static DateOnly GetWeekStart(DateOnly date)
    {
        var daysSinceMonday = ((int)date.DayOfWeek - (int)DayOfWeek.Monday + 7) % 7;
        return date.AddDays(-daysSinceMonday);
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

public sealed record CurrentWeeklyReviewResponse(
    DateOnly WeekStartOn,
    DateOnly WeekEndOn,
    WeeklyReviewResponse? Review);
