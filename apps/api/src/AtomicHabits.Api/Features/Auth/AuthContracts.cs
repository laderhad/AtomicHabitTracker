using AtomicHabits.Api.Common.Auth;

namespace AtomicHabits.Api.Features.Auth;

public sealed record RegisterRequest(
    string Email,
    string Password,
    string DisplayName,
    string? PreferredLanguage,
    string? TimeZone,
    string? DeviceName);

public sealed record LoginRequest(
    string Email,
    string Password,
    string? DeviceName);

public sealed record RefreshTokenRequest(string RefreshToken);

public sealed record LogoutRequest(string RefreshToken);

public sealed record AuthResponse(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    UserProfileResponse User);

public sealed record UserProfileResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string PreferredLanguage,
    string TimeZone,
    string PrivacyLevel);

public static class UserProfileMapping
{
    public static UserProfileResponse ToProfileResponse(this ApplicationUser user)
    {
        return new UserProfileResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            user.PreferredLanguage,
            user.TimeZone,
            user.PrivacyLevel);
    }
}
