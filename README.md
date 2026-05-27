# AtomicHabitTracker

A backend starter for a bilingual habit-building mobile app, inspired by Atomic Habits principles. This repo focuses on system design and behavior change mechanics without using book text or copyrighted material.

## What you get

- ASP.NET Core 10 minimal API
- Modular monolith + vertical slice structure
- PostgreSQL + EF Core
- ASP.NET Core Identity + JWT access + rotating refresh tokens
- Docker Compose for API, PostgreSQL, and Redis
- Starter features: health, auth, me/preferences, devices, habits, habit logs, reminders, progress dashboard, weekly reviews

## Quick start

```bash
docker compose -f infra/docker/compose.yaml up -d db redis api
```

API base URL:

```text
http://localhost:8080
```

Health check:

```bash
curl http://localhost:8080/api/v1/health
```

Register:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "demo@example.com",
    "password": "Password1234",
    "displayName": "Demo User",
    "preferredLanguage": "tr-TR",
    "timeZone": "Europe/Istanbul",
    "deviceName": "local-dev"
  }'
```

Protected endpoints require the `Authorization: Bearer <accessToken>` header.

Device register:

```bash
curl -X POST http://localhost:8080/api/v1/devices/register \
  -H "Authorization: Bearer <accessToken>" \
  -H 'Content-Type: application/json' \
  -d '{
    "platform": "ios",
    "pushToken": "ExponentPushToken[...]",
    "authorizationStatus": "authorized",
    "deviceName": "Kerem iPhone",
    "appVersion": "1.0.0",
    "timeZone": "Europe/Istanbul"
  }'
```

Habit reminder:

```bash
curl -X PUT http://localhost:8080/api/v1/habits/<habitId>/reminders \
  -H "Authorization: Bearer <accessToken>" \
  -H 'Content-Type: application/json' \
  -d '{
    "enabled": true,
    "triggerTime": "21:25",
    "timeZone": "Europe/Istanbul",
    "channel": "local",
    "daysOfWeek": [1, 2, 3, 4, 5],
    "quietHoursStart": "23:00",
    "quietHoursEnd": "07:00"
  }'
```

Weekly review:

```bash
curl -X PUT http://localhost:8080/api/v1/reviews/weekly/2026-06-01 \
  -H "Authorization: Bearer <accessToken>" \
  -H 'Content-Type: application/json' \
  -d '{
    "consistencyScore": 88,
    "whatWorked": "Evening cue made the habit easier to start.",
    "whatWasHard": "Late meetings pushed the routine back.",
    "adjustment": "Move the reminder 20 minutes earlier on weekdays.",
    "mood": "focused"
  }'
```

List weekly reviews:

```bash
curl "http://localhost:8080/api/v1/reviews/weekly?from=2026-06-01&to=2026-06-30" \
  -H "Authorization: Bearer <accessToken>"
```

## Tests

```bash
dotnet build AtomicHabitTracker.sln
dotnet test AtomicHabitTracker.sln
```

## Notes

- Auth flow: ASP.NET Core Identity + JWT access token + hashed rotating refresh token.
- Device registration upserts by push token; push tokens are never returned in responses.
- Reminders are one per habit; local or push channel supported with day filters and quiet hours.
- Weekly reviews are keyed by Monday week start dates and support score, reflection notes, adjustment, and mood.
- Docker Compose applies EF migrations on API startup.
- `DateTimeOffset` values are stored in UTC; streak logic preserves the request local day.
