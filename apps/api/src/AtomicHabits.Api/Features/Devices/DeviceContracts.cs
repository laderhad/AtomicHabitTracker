namespace AtomicHabits.Api.Features.Devices;

public sealed record RegisterDeviceRequest(
    string Platform,
    string PushToken,
    string AuthorizationStatus,
    string? DeviceName,
    string? AppVersion,
    string? TimeZone);

public sealed record UpdateDeviceAuthorizationRequest(string AuthorizationStatus);

public sealed record DeviceResponse(
    Guid Id,
    string Platform,
    string AuthorizationStatus,
    string DeviceName,
    string AppVersion,
    string TimeZone,
    DateTimeOffset CreatedAt,
    DateTimeOffset LastSeenAt,
    bool IsRevoked);

public static class DeviceMapping
{
    public static DeviceResponse ToResponse(this Device device)
    {
        return new DeviceResponse(
            device.Id,
            device.Platform,
            device.AuthorizationStatus,
            device.DeviceName,
            device.AppVersion,
            device.TimeZone,
            device.CreatedAt,
            device.LastSeenAt,
            device.RevokedAt is not null);
    }
}
