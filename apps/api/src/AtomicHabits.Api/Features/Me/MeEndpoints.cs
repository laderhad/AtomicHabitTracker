using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Features.Auth;
using Microsoft.AspNetCore.Identity;

namespace AtomicHabits.Api.Features.Me;

public static class MeEndpoints
{
    private static readonly HashSet<string> SupportedPrivacyLevels = ["private", "friends", "public"];

    public static IEndpointRouteBuilder MapMeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/me")
            .WithTags("Me")
            .RequireAuthorization();

        group.MapGet("/", GetMe)
            .WithName("GetMe");

        group.MapPatch("/preferences", UpdatePreferences)
            .WithName("UpdateMyPreferences");

        return app;
    }

    private static async Task<IResult> GetMe(
        ICurrentUser currentUser,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(currentUser.UserId.ToString());
        return user is null ? Results.NotFound() : Results.Ok(user.ToProfileResponse());
    }

    private static async Task<IResult> UpdatePreferences(
        UpdatePreferencesRequest request,
        ICurrentUser currentUser,
        UserManager<ApplicationUser> userManager)
    {
        var user = await userManager.FindByIdAsync(currentUser.UserId.ToString());
        if (user is null)
        {
            return Results.NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.PreferredLanguage))
        {
            user.PreferredLanguage = request.PreferredLanguage.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.TimeZone))
        {
            user.TimeZone = request.TimeZone.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.PrivacyLevel))
        {
            var privacyLevel = request.PrivacyLevel.Trim().ToLowerInvariant();
            if (!SupportedPrivacyLevels.Contains(privacyLevel))
            {
                return Results.BadRequest(new { error = "privacyLevel must be private, friends or public." });
            }

            user.PrivacyLevel = privacyLevel;
        }

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Results.ValidationProblem(result.Errors
                .GroupBy(error => error.Code)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.Description).ToArray()));
        }

        return Results.Ok(user.ToProfileResponse());
    }
}
