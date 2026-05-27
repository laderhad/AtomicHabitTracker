using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Devices;

public static class DeviceEndpoints
{
    private static readonly HashSet<string> SupportedPlatforms = ["ios", "android"];

    private static readonly HashSet<string> SupportedAuthorizationStatuses =
    [
        "authorized",
        "denied",
        "not_determined",
        "provisional"
    ];

    public static IEndpointRouteBuilder MapDeviceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/devices")
            .WithTags("Devices")
            .RequireAuthorization();

        group.MapGet("/", ListDevices)
            .WithName("ListDevices");

        group.MapPost("/register", RegisterDevice)
            .WithName("RegisterDevice");

        group.MapPatch("/{deviceId:guid}/authorization", UpdateAuthorization)
            .WithName("UpdateDeviceAuthorization");

        group.MapDelete("/{deviceId:guid}", RevokeDevice)
            .WithName("RevokeDevice");

        return app;
    }

    private static async Task<IResult> ListDevices(
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        CancellationToken cancellationToken)
    {
        var devices = await dbContext.Devices
            .AsNoTracking()
            .Where(device => device.UserId == currentUser.UserId)
            .OrderByDescending(device => device.LastSeenAt)
            .Select(device => device.ToResponse())
            .ToListAsync(cancellationToken);

        return Results.Ok(devices);
    }

    private static async Task<IResult> RegisterDevice(
        RegisterDeviceRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var platform = Normalize(request.Platform);
        var authorizationStatus = Normalize(request.AuthorizationStatus);

        if (!SupportedPlatforms.Contains(platform))
        {
            return Results.BadRequest(new { error = "platform must be ios or android." });
        }

        if (string.IsNullOrWhiteSpace(request.PushToken))
        {
            return Results.BadRequest(new { error = "pushToken is required." });
        }

        if (!SupportedAuthorizationStatuses.Contains(authorizationStatus))
        {
            return Results.BadRequest(new { error = "authorizationStatus is invalid." });
        }

        var pushToken = request.PushToken.Trim();
        var now = clock.UtcNow;

        var device = await dbContext.Devices
            .FirstOrDefaultAsync(
                device => device.PushToken == pushToken,
                cancellationToken);

        if (device is null)
        {
            device = new Device
            {
                UserId = currentUser.UserId,
                PushToken = pushToken,
                CreatedAt = now
            };

            dbContext.Devices.Add(device);
        }
        else if (device.UserId != currentUser.UserId)
        {
            device.UserId = currentUser.UserId;
        }

        device.Platform = platform;
        device.AuthorizationStatus = authorizationStatus;
        device.DeviceName = request.DeviceName?.Trim() ?? device.DeviceName;
        device.AppVersion = request.AppVersion?.Trim() ?? device.AppVersion;
        device.TimeZone = request.TimeZone?.Trim() ?? device.TimeZone;
        device.LastSeenAt = now;
        device.RevokedAt = null;

        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Ok(device.ToResponse());
    }

    private static async Task<IResult> UpdateAuthorization(
        Guid deviceId,
        UpdateDeviceAuthorizationRequest request,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var authorizationStatus = Normalize(request.AuthorizationStatus);
        if (!SupportedAuthorizationStatuses.Contains(authorizationStatus))
        {
            return Results.BadRequest(new { error = "authorizationStatus is invalid." });
        }

        var device = await dbContext.Devices
            .FirstOrDefaultAsync(
                device => device.Id == deviceId && device.UserId == currentUser.UserId,
                cancellationToken);

        if (device is null)
        {
            return Results.NotFound();
        }

        device.AuthorizationStatus = authorizationStatus;
        device.LastSeenAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.Ok(device.ToResponse());
    }

    private static async Task<IResult> RevokeDevice(
        Guid deviceId,
        AtomicHabitsDbContext dbContext,
        ICurrentUser currentUser,
        IClock clock,
        CancellationToken cancellationToken)
    {
        var device = await dbContext.Devices
            .FirstOrDefaultAsync(
                device => device.Id == deviceId && device.UserId == currentUser.UserId,
                cancellationToken);

        if (device is null)
        {
            return Results.NotFound();
        }

        device.RevokedAt = clock.UtcNow;
        device.AuthorizationStatus = "denied";
        device.LastSeenAt = clock.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static string Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLowerInvariant();
    }
}
