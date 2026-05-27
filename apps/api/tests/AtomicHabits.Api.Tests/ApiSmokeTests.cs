using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AtomicHabits.Api.Features.Auth;
using AtomicHabits.Api.Features.Devices;
using AtomicHabits.Api.Features.Habits;
using AtomicHabits.Api.Features.Reminders;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace AtomicHabits.Api.Tests;

public sealed class ApiSmokeTests
{
    [Fact]
    public async Task Health_endpoint_returns_ok()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Habit_can_be_created_and_checked_in()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var createResponse = await client.PostAsJsonAsync("/api/v1/habits", new CreateHabitRequest(
            "20 dakika kitap oku",
            Description: null,
            Category: "learning",
            IdentityStatement: "Ben her gun okuyan biriyim.",
            CueType: "time_and_place",
            CueText: "Her aksam 21:30",
            RewardText: "Ilerleme halkasi dolsun",
            Difficulty: "easy"));

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var habit = await createResponse.Content.ReadFromJsonAsync<HabitResponse>();
        Assert.NotNull(habit);
        Assert.Equal("20 dakika kitap oku", habit.Name);

        var logResponse = await client.PostAsJsonAsync($"/api/v1/habits/{habit.Id}/logs", new CreateHabitLogRequest(
            Status: "completed",
            OccurredAt: new DateTimeOffset(2026, 6, 1, 21, 34, 0, TimeSpan.FromHours(3)),
            Value: 20,
            Unit: "minute",
            Note: "Bugun 18 sayfa okudum",
            Source: "manual"));

        Assert.Equal(HttpStatusCode.Created, logResponse.StatusCode);
        var log = await logResponse.Content.ReadFromJsonAsync<HabitLogResponse>();
        Assert.NotNull(log);
        Assert.Equal(1, log.Streak?.CurrentStreak);
        Assert.Equal(TimeSpan.Zero, log.OccurredAt.Offset);
        Assert.Equal(new DateOnly(2026, 6, 1), log.Streak?.LastCompletedOn);
    }

    [Fact]
    public async Task Protected_endpoints_require_access_token()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/habits");
        var devicesResponse = await client.GetAsync("/api/v1/devices");
        var remindersResponse = await client.GetAsync($"/api/v1/habits/{Guid.NewGuid()}/reminders");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, devicesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, remindersResponse.StatusCode);
    }

    [Fact]
    public async Task Refresh_token_is_rotated()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);

        var refreshResponse = await client.PostAsJsonAsync(
            "/api/v1/auth/refresh",
            new RefreshTokenRequest(auth.RefreshToken));

        Assert.Equal(HttpStatusCode.OK, refreshResponse.StatusCode);
        var refreshed = await refreshResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(refreshed);
        Assert.NotEqual(auth.RefreshToken, refreshed.RefreshToken);

        var replayResponse = await client.PostAsJsonAsync(
            "/api/v1/auth/refresh",
            new RefreshTokenRequest(auth.RefreshToken));

        Assert.Equal(HttpStatusCode.Unauthorized, replayResponse.StatusCode);
    }

    [Fact]
    public async Task Device_can_be_registered_updated_and_revoked()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var registerResponse = await client.PostAsJsonAsync("/api/v1/devices/register", new RegisterDeviceRequest(
            "ios",
            "ExponentPushToken[test-device]",
            "authorized",
            "Kerem iPhone",
            "1.0.0",
            "Europe/Istanbul"));

        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);
        var device = await registerResponse.Content.ReadFromJsonAsync<DeviceResponse>();
        Assert.NotNull(device);
        Assert.Equal("ios", device.Platform);
        Assert.Equal("authorized", device.AuthorizationStatus);
        Assert.False(device.IsRevoked);

        var updateResponse = await client.PostAsJsonAsync("/api/v1/devices/register", new RegisterDeviceRequest(
            "ios",
            "ExponentPushToken[test-device]",
            "denied",
            "Kerem iPhone 15",
            "1.0.1",
            "Europe/Istanbul"));

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<DeviceResponse>();
        Assert.NotNull(updated);
        Assert.Equal(device.Id, updated.Id);
        Assert.Equal("denied", updated.AuthorizationStatus);
        Assert.Equal("Kerem iPhone 15", updated.DeviceName);

        var list = await client.GetFromJsonAsync<List<DeviceResponse>>("/api/v1/devices");
        Assert.NotNull(list);
        Assert.Single(list);

        var revokeResponse = await client.DeleteAsync($"/api/v1/devices/{device.Id}");
        Assert.Equal(HttpStatusCode.NoContent, revokeResponse.StatusCode);

        var revokedList = await client.GetFromJsonAsync<List<DeviceResponse>>("/api/v1/devices");
        Assert.NotNull(revokedList);
        Assert.True(revokedList.Single().IsRevoked);
        Assert.Equal("denied", revokedList.Single().AuthorizationStatus);
    }

    [Fact]
    public async Task Reminder_can_be_upserted_fetched_and_disabled()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);
        var habit = await CreateHabitAsync(client);

        var upsertResponse = await client.PutAsJsonAsync($"/api/v1/habits/{habit.Id}/reminders", new UpsertHabitReminderRequest(
            Enabled: true,
            TriggerTime: "21:25",
            TimeZone: "Europe/Istanbul",
            Channel: "local",
            DaysOfWeek: [1, 2, 3, 4, 5],
            QuietHoursStart: "23:00",
            QuietHoursEnd: "07:00"));

        Assert.Equal(HttpStatusCode.OK, upsertResponse.StatusCode);
        var reminder = await upsertResponse.Content.ReadFromJsonAsync<HabitReminderResponse>();
        Assert.NotNull(reminder);
        Assert.True(reminder.Enabled);
        Assert.Equal("21:25", reminder.TriggerTime);
        Assert.Equal([1, 2, 3, 4, 5], reminder.DaysOfWeek);

        var updateResponse = await client.PutAsJsonAsync($"/api/v1/habits/{habit.Id}/reminders", new UpsertHabitReminderRequest(
            Enabled: true,
            TriggerTime: "08:10",
            TimeZone: "Europe/Istanbul",
            Channel: "push",
            DaysOfWeek: [1, 7, 1],
            QuietHoursStart: null,
            QuietHoursEnd: null));

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<HabitReminderResponse>();
        Assert.NotNull(updated);
        Assert.Equal(reminder.Id, updated.Id);
        Assert.Equal("push", updated.Channel);
        Assert.Equal([1, 7], updated.DaysOfWeek);

        var getResponse = await client.GetAsync($"/api/v1/habits/{habit.Id}/reminders");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var disableResponse = await client.DeleteAsync($"/api/v1/habits/{habit.Id}/reminders");
        Assert.Equal(HttpStatusCode.NoContent, disableResponse.StatusCode);

        var disabled = await client.GetFromJsonAsync<HabitReminderResponse>($"/api/v1/habits/{habit.Id}/reminders");
        Assert.NotNull(disabled);
        Assert.False(disabled.Enabled);
    }

    private static WebApplicationFactory<Program> CreateFactory()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.UseEnvironment("Testing"));
    }

    private static async Task<AuthResponse> RegisterAsync(HttpClient client)
    {
        var email = $"test-{Guid.NewGuid():N}@example.com";
        var response = await client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest(
            email,
            "Password1234",
            "Test User",
            "tr-TR",
            "Europe/Istanbul",
            "test-suite"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        return auth;
    }

    private static async Task<HabitResponse> CreateHabitAsync(HttpClient client)
    {
        var createResponse = await client.PostAsJsonAsync("/api/v1/habits", new CreateHabitRequest(
            "20 dakika kitap oku",
            Description: null,
            Category: "learning",
            IdentityStatement: "Ben her gun okuyan biriyim.",
            CueType: "time_and_place",
            CueText: "Her aksam 21:30",
            RewardText: "Ilerleme halkasi dolsun",
            Difficulty: "easy"));

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var habit = await createResponse.Content.ReadFromJsonAsync<HabitResponse>();
        Assert.NotNull(habit);
        return habit;
    }
}
