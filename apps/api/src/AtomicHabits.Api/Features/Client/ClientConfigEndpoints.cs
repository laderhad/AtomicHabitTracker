using AtomicHabits.Api.Common.Time;

namespace AtomicHabits.Api.Features.Client;

public static class ClientConfigEndpoints
{
    public static IEndpointRouteBuilder MapClientConfigEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/client/config", GetClientConfig)
            .AllowAnonymous()
            .WithName("GetClientConfig")
            .WithTags("Client");

        return app;
    }

    private static IResult GetClientConfig(
        IClock clock,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var openApiEnabled = environment.IsDevelopment() ||
            configuration.GetValue<bool>("OpenApi:Enabled");

        return Results.Ok(new ClientConfigResponse(
            Service: "Routivo.Api",
            ApiVersion: "v1",
            UtcNow: clock.UtcNow,
            SupportedCultures: ["tr-TR", "en-US"],
            DefaultCulture: "tr-TR",
            FallbackCulture: "en-US",
            DeepLinkScheme: "routivo",
            OpenApiUrl: "/openapi/v1.json",
            OpenApiEnabled: openApiEnabled,
            Features: new ClientFeatureFlags(
                Auth: true,
                Habits: true,
                Reminders: true,
                Progress: true,
                WeeklyReviews: true,
                Challenges: true,
                ShareCards: true,
                Gamification: true,
                BadgeNotifications: true)));
    }
}

public sealed record ClientConfigResponse(
    string Service,
    string ApiVersion,
    DateTimeOffset UtcNow,
    IReadOnlyCollection<string> SupportedCultures,
    string DefaultCulture,
    string FallbackCulture,
    string DeepLinkScheme,
    string OpenApiUrl,
    bool OpenApiEnabled,
    ClientFeatureFlags Features);

public sealed record ClientFeatureFlags(
    bool Auth,
    bool Habits,
    bool Reminders,
    bool Progress,
    bool WeeklyReviews,
    bool Challenges,
    bool ShareCards,
    bool Gamification,
    bool BadgeNotifications);
