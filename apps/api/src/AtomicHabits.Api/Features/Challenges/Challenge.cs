using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Challenges;

public sealed class Challenge
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CreatedByUserId { get; set; }

    public ApplicationUser? CreatedByUser { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTimeOffset StartAt { get; set; }

    public DateTimeOffset EndAt { get; set; }

    public string Visibility { get; set; } = ChallengeVisibility.InviteOnly;

    public string InviteCode { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<ChallengeParticipant> Participants { get; set; } = [];

    public ICollection<ChallengeCheckIn> CheckIns { get; set; } = [];
}

public static class ChallengeVisibility
{
    public const string Private = "private";

    public const string InviteOnly = "invite_only";

    public const string Public = "public";
}
