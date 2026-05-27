namespace AtomicHabits.Api.Features.Me;

public sealed record UpdatePreferencesRequest(
    string? PreferredLanguage,
    string? TimeZone,
    string? PrivacyLevel);
