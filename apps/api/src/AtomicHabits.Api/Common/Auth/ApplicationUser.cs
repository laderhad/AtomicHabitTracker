using Microsoft.AspNetCore.Identity;

namespace AtomicHabits.Api.Common.Auth;

public sealed class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;

    public string PreferredLanguage { get; set; } = "tr-TR";

    public string TimeZone { get; set; } = "Europe/Istanbul";

    public string PrivacyLevel { get; set; } = "private";

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
