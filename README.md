# Habit Tracking Productivity App

**Mobile-first habit tracking with secure auth and actionable progress insights.**

![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-10.0-512BD4?logo=dotnet)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?logo=postgresql&logoColor=white)
![EF Core](https://img.shields.io/badge/EF%20Core-8-512BD4?logo=dotnet)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![React / PWA](https://img.shields.io/badge/React%20%2F%20PWA-Mobile--first-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-xUnit-5C2D91)

A mobile-first habit tracking application designed to help users build sustainable routines through daily check-ins, streak tracking, reminders, and progress insights. The backend is an ASP.NET Core Minimal API secured with Identity, JWT access tokens, and rotating refresh tokens, backed by PostgreSQL via EF Core. The frontend delivers a responsive PWA experience with settings, privacy, and notifications screens.

## Product Overview

- Users register and sign in securely.
- Create and manage habits with daily check-ins.
- Track streaks and progress insights.
- Configure reminders with device registration support.
- Access settings, notifications, language, and privacy screens.
- Mobile-first PWA experience optimized for everyday use.

## Core Features

- User registration and login
- JWT access tokens and rotating refresh tokens
- Habit creation and management
- Daily habit check-ins
- Streak tracking
- Progress dashboard
- Reminder configuration
- Device registration
- Settings and privacy screens
- Mobile-first PWA interface
- Dockerized backend environment
- Smoke and integration tests

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React<br>TypeScript<br>PWA mobile-first UI |
| Backend | ASP.NET Core Minimal API<br>ASP.NET Core Identity<br>JWT authentication<br>Rotating refresh tokens |
| Database | PostgreSQL<br>EF Core<br>EF Core migrations |
| Infrastructure | Docker Compose<br>Redis |
| Testing | xUnit<br>WebApplicationFactory<br>Smoke and integration tests |

## Architecture

- Modular monolith with a single deployable backend
- Vertical slice organization per feature
- Feature-based structure with clear boundaries
- Core areas include Auth, Habits, Devices, Reminders, and Progress

## Legal Note

This project is an independent habit tracker and does not include copyrighted book text or official book content.
