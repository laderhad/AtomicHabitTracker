namespace AtomicHabits.Api.Features.ShareCards;

public sealed record CreateShareCardRequest(
    string Type,
    string? Title,
    string? Subtitle,
    string? TargetType,
    Guid? TargetId);

public sealed record ShareCardResponse(
    Guid Id,
    string Type,
    string Title,
    string Subtitle,
    string ImageUrl,
    string DeepLink,
    DateTimeOffset CreatedAt);

public static class ShareCardMapping
{
    public static ShareCardResponse ToResponse(this ShareCard shareCard)
    {
        return new ShareCardResponse(
            shareCard.Id,
            shareCard.Type,
            shareCard.Title,
            shareCard.Subtitle,
            shareCard.ImageUrl,
            shareCard.DeepLink,
            shareCard.CreatedAt);
    }
}
