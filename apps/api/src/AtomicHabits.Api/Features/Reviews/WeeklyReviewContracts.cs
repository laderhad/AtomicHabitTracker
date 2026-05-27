namespace AtomicHabits.Api.Features.Reviews;

public sealed record UpsertWeeklyReviewRequest(
    int? ConsistencyScore,
    string? WhatWorked,
    string? WhatWasHard,
    string? Adjustment,
    string? Mood);

public sealed record WeeklyReviewResponse(
    Guid Id,
    DateOnly WeekStartOn,
    DateOnly WeekEndOn,
    int? ConsistencyScore,
    string WhatWorked,
    string WhatWasHard,
    string Adjustment,
    string Mood,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class WeeklyReviewMapping
{
    public static WeeklyReviewResponse ToResponse(this WeeklyReview review)
    {
        return new WeeklyReviewResponse(
            review.Id,
            review.WeekStartOn,
            review.WeekStartOn.AddDays(6),
            review.ConsistencyScore,
            review.WhatWorked,
            review.WhatWasHard,
            review.Adjustment,
            review.Mood,
            review.CreatedAt,
            review.UpdatedAt);
    }
}
