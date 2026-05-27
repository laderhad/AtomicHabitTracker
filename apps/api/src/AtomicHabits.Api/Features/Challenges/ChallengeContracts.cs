namespace AtomicHabits.Api.Features.Challenges;

public sealed record CreateChallengeRequest(
    string Title,
    string? Description,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt,
    string? Visibility);

public sealed record JoinChallengeRequest(string? InviteCode);

public sealed record CreateChallengeCheckInRequest(Guid HabitLogId);

public sealed record ChallengeResponse(
    Guid Id,
    string Title,
    string Description,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt,
    string Visibility,
    string? InviteCode,
    int ParticipantCount,
    string? CurrentUserRole,
    DateTimeOffset CreatedAt);

public sealed record ChallengeParticipantResponse(
    Guid UserId,
    string Role,
    DateTimeOffset JoinedAt);

public sealed record ChallengeCheckInResponse(
    Guid Id,
    Guid ChallengeId,
    Guid HabitLogId,
    Guid UserId,
    DateTimeOffset CreatedAt);

public static class ChallengeMapping
{
    public static ChallengeResponse ToResponse(this Challenge challenge, Guid currentUserId)
    {
        var currentUserRole = challenge.Participants
            .FirstOrDefault(participant => participant.UserId == currentUserId)
            ?.Role;

        return new ChallengeResponse(
            challenge.Id,
            challenge.Title,
            challenge.Description,
            challenge.StartAt,
            challenge.EndAt,
            challenge.Visibility,
            currentUserRole is null ? null : challenge.InviteCode,
            challenge.Participants.Count,
            currentUserRole,
            challenge.CreatedAt);
    }

    public static ChallengeParticipantResponse ToResponse(this ChallengeParticipant participant)
    {
        return new ChallengeParticipantResponse(
            participant.UserId,
            participant.Role,
            participant.JoinedAt);
    }

    public static ChallengeCheckInResponse ToResponse(this ChallengeCheckIn checkIn)
    {
        return new ChallengeCheckInResponse(
            checkIn.Id,
            checkIn.ChallengeId,
            checkIn.HabitLogId,
            checkIn.UserId,
            checkIn.CreatedAt);
    }
}
