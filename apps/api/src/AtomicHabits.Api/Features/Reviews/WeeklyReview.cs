using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Reviews;

public sealed class WeeklyReview
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public DateOnly WeekStartOn { get; set; }

    public int? ConsistencyScore { get; set; }

    public string WhatWorked { get; set; } = string.Empty;

    public string WhatWasHard { get; set; } = string.Empty;

    public string Adjustment { get; set; } = string.Empty;

    public string Mood { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
