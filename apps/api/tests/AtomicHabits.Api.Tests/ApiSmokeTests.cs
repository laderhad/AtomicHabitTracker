using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using AtomicHabits.Api.Features.Auth;
using AtomicHabits.Api.Features.Challenges;
using AtomicHabits.Api.Features.Devices;
using AtomicHabits.Api.Features.Gamification;
using AtomicHabits.Api.Features.Habits;
using AtomicHabits.Api.Features.Reminders;
using AtomicHabits.Api.Features.Reviews;
using AtomicHabits.Api.Features.ShareCards;
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
        var reviewsResponse = await client.GetAsync("/api/v1/reviews/weekly");
        var challengesResponse = await client.GetAsync("/api/v1/challenges");
        var shareCardsResponse = await client.GetAsync("/api/v1/share-cards");
        var badgesResponse = await client.GetAsync("/api/v1/gamification/badges");
        var summaryResponse = await client.GetAsync("/api/v1/gamification/summary");
        var unlocksResponse = await client.GetAsync("/api/v1/gamification/unlocks");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, devicesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, remindersResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, reviewsResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, challengesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, shareCardsResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, badgesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, summaryResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unlocksResponse.StatusCode);
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

    [Fact]
    public async Task Weekly_review_can_be_upserted_listed_and_deleted()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var badWeekResponse = await client.PutAsJsonAsync("/api/v1/reviews/weekly/2026-06-02", new UpsertWeeklyReviewRequest(
            ConsistencyScore: 80,
            WhatWorked: "Morning check-ins helped.",
            WhatWasHard: "Evenings were noisy.",
            Adjustment: "Move reading earlier.",
            Mood: "steady"));

        Assert.Equal(HttpStatusCode.BadRequest, badWeekResponse.StatusCode);

        var upsertResponse = await client.PutAsJsonAsync("/api/v1/reviews/weekly/2026-06-01", new UpsertWeeklyReviewRequest(
            ConsistencyScore: 82,
            WhatWorked: "Morning check-ins helped.",
            WhatWasHard: "Evenings were noisy.",
            Adjustment: "Move reading earlier.",
            Mood: "steady"));

        Assert.Equal(HttpStatusCode.OK, upsertResponse.StatusCode);
        var review = await upsertResponse.Content.ReadFromJsonAsync<WeeklyReviewResponse>();
        Assert.NotNull(review);
        Assert.Equal(new DateOnly(2026, 6, 1), review.WeekStartOn);
        Assert.Equal(new DateOnly(2026, 6, 7), review.WeekEndOn);
        Assert.Equal(82, review.ConsistencyScore);

        var updateResponse = await client.PutAsJsonAsync("/api/v1/reviews/weekly/2026-06-01", new UpsertWeeklyReviewRequest(
            ConsistencyScore: 90,
            WhatWorked: "Templates made the day easy.",
            WhatWasHard: "I skipped one lunch walk.",
            Adjustment: "Set a lunch reminder.",
            Mood: "focused"));

        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        var updated = await updateResponse.Content.ReadFromJsonAsync<WeeklyReviewResponse>();
        Assert.NotNull(updated);
        Assert.Equal(review.Id, updated.Id);
        Assert.Equal(90, updated.ConsistencyScore);
        Assert.Equal("focused", updated.Mood);

        var getResponse = await client.GetAsync("/api/v1/reviews/weekly/2026-06-01");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var list = await client.GetFromJsonAsync<List<WeeklyReviewResponse>>("/api/v1/reviews/weekly?from=2026-06-01&to=2026-06-30");
        Assert.NotNull(list);
        Assert.Single(list);

        var current = await client.GetFromJsonAsync<CurrentWeeklyReviewResponse>("/api/v1/reviews/weekly/current");
        Assert.NotNull(current);
        Assert.True(current.WeekStartOn.DayOfWeek == DayOfWeek.Monday);

        var deleteResponse = await client.DeleteAsync("/api/v1/reviews/weekly/2026-06-01");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var missingResponse = await client.GetAsync("/api/v1/reviews/weekly/2026-06-01");
        Assert.Equal(HttpStatusCode.NotFound, missingResponse.StatusCode);
    }

    [Fact]
    public async Task Challenge_can_be_joined_checked_in_and_shared()
    {
        using var factory = CreateFactory();
        using var ownerClient = factory.CreateClient();
        using var memberClient = factory.CreateClient();

        var ownerAuth = await RegisterAsync(ownerClient);
        ownerClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ownerAuth.AccessToken);

        var memberAuth = await RegisterAsync(memberClient);
        memberClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", memberAuth.AccessToken);

        var createChallengeResponse = await ownerClient.PostAsJsonAsync("/api/v1/challenges", new CreateChallengeRequest(
            "June reading buddy",
            "Complete one tiny reading habit together.",
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(14),
            "invite_only"));

        Assert.Equal(HttpStatusCode.Created, createChallengeResponse.StatusCode);
        var challenge = await createChallengeResponse.Content.ReadFromJsonAsync<ChallengeResponse>();
        Assert.NotNull(challenge);
        Assert.Equal("owner", challenge.CurrentUserRole);
        Assert.Equal(1, challenge.ParticipantCount);
        Assert.False(string.IsNullOrWhiteSpace(challenge.InviteCode));

        var hiddenResponse = await memberClient.GetAsync($"/api/v1/challenges/{challenge.Id}");
        Assert.Equal(HttpStatusCode.NotFound, hiddenResponse.StatusCode);

        var badJoinResponse = await memberClient.PostAsJsonAsync(
            $"/api/v1/challenges/{challenge.Id}/join",
            new JoinChallengeRequest(null));

        Assert.Equal(HttpStatusCode.BadRequest, badJoinResponse.StatusCode);

        var joinResponse = await memberClient.PostAsJsonAsync(
            $"/api/v1/challenges/{challenge.Id}/join",
            new JoinChallengeRequest(challenge.InviteCode));

        Assert.Equal(HttpStatusCode.OK, joinResponse.StatusCode);
        var joined = await joinResponse.Content.ReadFromJsonAsync<ChallengeResponse>();
        Assert.NotNull(joined);
        Assert.Equal("member", joined.CurrentUserRole);
        Assert.Equal(2, joined.ParticipantCount);

        var list = await memberClient.GetFromJsonAsync<List<ChallengeResponse>>("/api/v1/challenges");
        Assert.NotNull(list);
        Assert.Contains(list, item => item.Id == challenge.Id);

        var participants = await ownerClient.GetFromJsonAsync<List<ChallengeParticipantResponse>>(
            $"/api/v1/challenges/{challenge.Id}/participants");

        Assert.NotNull(participants);
        Assert.Equal(2, participants.Count);

        var memberHabit = await CreateHabitAsync(memberClient);
        var memberLog = await CreateCompletedLogAsync(memberClient, memberHabit.Id);

        var checkInResponse = await memberClient.PostAsJsonAsync(
            $"/api/v1/challenges/{challenge.Id}/check-ins",
            new CreateChallengeCheckInRequest(memberLog.Id));

        Assert.Equal(HttpStatusCode.Created, checkInResponse.StatusCode);
        var checkIn = await checkInResponse.Content.ReadFromJsonAsync<ChallengeCheckInResponse>();
        Assert.NotNull(checkIn);
        Assert.Equal(challenge.Id, checkIn.ChallengeId);
        Assert.Equal(memberLog.Id, checkIn.HabitLogId);

        var duplicateCheckInResponse = await memberClient.PostAsJsonAsync(
            $"/api/v1/challenges/{challenge.Id}/check-ins",
            new CreateChallengeCheckInRequest(memberLog.Id));

        Assert.Equal(HttpStatusCode.OK, duplicateCheckInResponse.StatusCode);

        var shareCardResponse = await ownerClient.PostAsJsonAsync("/api/v1/share-cards", new CreateShareCardRequest(
            "challenge",
            "Join my reading challenge",
            "Small steps, together.",
            "challenge",
            challenge.Id));

        Assert.Equal(HttpStatusCode.Created, shareCardResponse.StatusCode);
        var shareCard = await shareCardResponse.Content.ReadFromJsonAsync<ShareCardResponse>();
        Assert.NotNull(shareCard);
        Assert.Equal("challenge", shareCard.Type);
        Assert.Equal($"atomichabits://challenges/{challenge.Id}", shareCard.DeepLink);

        var shareCards = await ownerClient.GetFromJsonAsync<List<ShareCardResponse>>("/api/v1/share-cards");
        Assert.NotNull(shareCards);
        Assert.Contains(shareCards, item => item.Id == shareCard.Id);
    }

    [Fact]
    public async Task Gamification_awards_habit_and_streak_badges_without_duplicates()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var badges = await client.GetFromJsonAsync<List<BadgeResponse>>("/api/v1/gamification/badges?culture=tr-TR");
        Assert.NotNull(badges);
        Assert.Equal(9, badges.Count);
        Assert.Contains(badges, badge => badge.Code == BadgeCodes.FirstHabit && badge.Title == "İlk alışkanlık");

        var habit = await CreateHabitAsync(client);

        for (var day = 1; day <= 10; day++)
        {
            await CreateCompletedLogAsync(
                client,
                habit.Id,
                new DateTimeOffset(2026, 6, day, 8, 0, 0, TimeSpan.Zero));
        }

        _ = await CreateHabitAsync(client);

        var unlocks = await client.GetFromJsonAsync<List<BadgeUnlockResponse>>("/api/v1/gamification/unlocks");
        Assert.NotNull(unlocks);
        Assert.Single(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstHabit);
        Assert.Single(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstCheckIn);
        Assert.Single(unlocks, unlock => unlock.BadgeCode == BadgeCodes.ThreeDayStreak);
        Assert.Single(unlocks, unlock => unlock.BadgeCode == BadgeCodes.SevenDayStreak);
        Assert.Single(unlocks, unlock => unlock.BadgeCode == BadgeCodes.TenCheckIns);
        Assert.DoesNotContain(unlocks, unlock => unlock.ContextJson.Contains("20 dakika kitap oku", StringComparison.Ordinal));

        var summary = await client.GetFromJsonAsync<GamificationSummaryResponse>("/api/v1/gamification/summary?culture=en-US");
        Assert.NotNull(summary);
        Assert.Equal(9, summary.TotalBadgeCount);
        Assert.True(summary.UnlockedBadgeCount >= 5);
        Assert.Contains(summary.Badges, badge => badge.Code == BadgeCodes.FirstHabit && badge.IsUnlocked);
        Assert.Contains(summary.Badges, badge => badge.Code == BadgeCodes.ThreeDayStreak && badge.IsUnlocked);
        Assert.NotEmpty(summary.RecentUnlocks);
    }

    [Fact]
    public async Task Gamification_awards_review_social_and_share_badges()
    {
        using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var weeklyReviewResponse = await client.PutAsJsonAsync("/api/v1/reviews/weekly/2026-06-01", new UpsertWeeklyReviewRequest(
            ConsistencyScore: 88,
            WhatWorked: "Morning setup helped.",
            WhatWasHard: "One noisy evening.",
            Adjustment: "Move the reminder earlier.",
            Mood: "focused"));

        Assert.Equal(HttpStatusCode.OK, weeklyReviewResponse.StatusCode);

        var createChallengeResponse = await client.PostAsJsonAsync("/api/v1/challenges", new CreateChallengeRequest(
            "June reading buddy",
            "Complete one tiny reading habit together.",
            DateTimeOffset.UtcNow.AddDays(1),
            DateTimeOffset.UtcNow.AddDays(14),
            "invite_only"));

        Assert.Equal(HttpStatusCode.Created, createChallengeResponse.StatusCode);
        var challenge = await createChallengeResponse.Content.ReadFromJsonAsync<ChallengeResponse>();
        Assert.NotNull(challenge);

        var habit = await CreateHabitAsync(client);
        var log = await CreateCompletedLogAsync(client, habit.Id);

        var checkInResponse = await client.PostAsJsonAsync(
            $"/api/v1/challenges/{challenge.Id}/check-ins",
            new CreateChallengeCheckInRequest(log.Id));

        Assert.Equal(HttpStatusCode.Created, checkInResponse.StatusCode);

        var shareCardResponse = await client.PostAsJsonAsync("/api/v1/share-cards", new CreateShareCardRequest(
            "challenge",
            "Join my reading challenge",
            "Small steps, together.",
            "challenge",
            challenge.Id));

        Assert.Equal(HttpStatusCode.Created, shareCardResponse.StatusCode);

        var unlocks = await client.GetFromJsonAsync<List<BadgeUnlockResponse>>("/api/v1/gamification/unlocks");
        Assert.NotNull(unlocks);
        Assert.Contains(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstWeeklyReview);
        Assert.Contains(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstChallenge);
        Assert.Contains(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstChallengeCheckIn);
        Assert.Contains(unlocks, unlock => unlock.BadgeCode == BadgeCodes.FirstShareCard);
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

    private static async Task<HabitLogResponse> CreateCompletedLogAsync(
        HttpClient client,
        Guid habitId,
        DateTimeOffset? occurredAt = null)
    {
        var logResponse = await client.PostAsJsonAsync($"/api/v1/habits/{habitId}/logs", new CreateHabitLogRequest(
            Status: "completed",
            OccurredAt: occurredAt ?? DateTimeOffset.UtcNow,
            Value: 1,
            Unit: "check",
            Note: "Challenge check-in",
            Source: "challenge"));

        Assert.Equal(HttpStatusCode.Created, logResponse.StatusCode);
        var log = await logResponse.Content.ReadFromJsonAsync<HabitLogResponse>();
        Assert.NotNull(log);
        return log;
    }
}
