using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Challenges;

public sealed class ChallengeParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ChallengeId { get; set; }

    public Challenge? Challenge { get; set; }

    public Guid UserId { get; set; }

    public ApplicationUser? User { get; set; }

    public string Role { get; set; } = ChallengeParticipantRoles.Member;

    public DateTimeOffset JoinedAt { get; set; }
}

public static class ChallengeParticipantRoles
{
    public const string Owner = "owner";

    public const string Member = "member";
}
