using AtomicHabits.Api.Common.Time;

namespace AtomicHabits.Api.Features.Health;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/health", (IClock clock) => Results.Ok(new
        {
            status = "ok",
            service = "Routivo.Api",
            utcNow = clock.UtcNow
        }))
        .WithName("GetHealth")
        .WithTags("Health");

        return app;
    }
}
