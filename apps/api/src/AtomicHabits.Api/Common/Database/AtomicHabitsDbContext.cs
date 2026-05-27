using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Features.Auth;
using AtomicHabits.Api.Features.Devices;
using AtomicHabits.Api.Features.HabitLogs;
using AtomicHabits.Api.Features.Habits;
using AtomicHabits.Api.Features.Reminders;
using AtomicHabits.Api.Features.Reviews;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Common.Database;

public sealed class AtomicHabitsDbContext(DbContextOptions<AtomicHabitsDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Habit> Habits => Set<Habit>();

    public DbSet<HabitLog> HabitLogs => Set<HabitLog>();

    public DbSet<HabitStreak> HabitStreaks => Set<HabitStreak>();

    public DbSet<UserSession> UserSessions => Set<UserSession>();

    public DbSet<Device> Devices => Set<Device>();

    public DbSet<HabitReminder> HabitReminders => Set<HabitReminder>();

    public DbSet<WeeklyReview> WeeklyReviews => Set<WeeklyReview>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.DisplayName).HasMaxLength(160);
            entity.Property(user => user.PreferredLanguage).HasMaxLength(16);
            entity.Property(user => user.TimeZone).HasMaxLength(80);
            entity.Property(user => user.PrivacyLevel).HasMaxLength(32);
        });

        builder.Entity<Habit>(entity =>
        {
            entity.ToTable("habits");
            entity.HasKey(habit => habit.Id);
            entity.Property(habit => habit.Name).HasMaxLength(120).IsRequired();
            entity.Property(habit => habit.Description).HasMaxLength(600);
            entity.Property(habit => habit.Category).HasMaxLength(64).IsRequired();
            entity.Property(habit => habit.IdentityStatement).HasMaxLength(240);
            entity.Property(habit => habit.CueType).HasMaxLength(64);
            entity.Property(habit => habit.CueText).HasMaxLength(240);
            entity.Property(habit => habit.RewardText).HasMaxLength(240);
            entity.Property(habit => habit.Difficulty).HasMaxLength(32).IsRequired();
            entity.HasIndex(habit => new { habit.UserId, habit.IsArchived, habit.CreatedAt });
            entity.HasOne(habit => habit.User)
                .WithMany()
                .HasForeignKey(habit => habit.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HabitLog>(entity =>
        {
            entity.ToTable("habit_logs");
            entity.HasKey(log => log.Id);
            entity.Property(log => log.Status).HasMaxLength(32).IsRequired();
            entity.Property(log => log.Unit).HasMaxLength(32);
            entity.Property(log => log.Note).HasMaxLength(600);
            entity.Property(log => log.Source).HasMaxLength(32).IsRequired();
            entity.HasIndex(log => new { log.HabitId, log.OccurredAt });
            entity.HasOne(log => log.Habit)
                .WithMany(habit => habit.Logs)
                .HasForeignKey(log => log.HabitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HabitStreak>(entity =>
        {
            entity.ToTable("habit_streaks");
            entity.HasKey(streak => streak.HabitId);
            entity.HasOne(streak => streak.Habit)
                .WithOne(habit => habit.Streak)
                .HasForeignKey<HabitStreak>(streak => streak.HabitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserSession>(entity =>
        {
            entity.ToTable("user_sessions");
            entity.HasKey(session => session.Id);
            entity.Property(session => session.RefreshTokenHash).HasMaxLength(128).IsRequired();
            entity.Property(session => session.DeviceName).HasMaxLength(160);
            entity.HasIndex(session => session.RefreshTokenHash).IsUnique();
            entity.HasIndex(session => new { session.UserId, session.RevokedAt, session.ExpiresAt });
            entity.HasOne(session => session.User)
                .WithMany()
                .HasForeignKey(session => session.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Device>(entity =>
        {
            entity.ToTable("devices");
            entity.HasKey(device => device.Id);
            entity.Property(device => device.Platform).HasMaxLength(32).IsRequired();
            entity.Property(device => device.PushToken).HasMaxLength(512).IsRequired();
            entity.Property(device => device.AuthorizationStatus).HasMaxLength(32).IsRequired();
            entity.Property(device => device.DeviceName).HasMaxLength(160);
            entity.Property(device => device.AppVersion).HasMaxLength(64);
            entity.Property(device => device.TimeZone).HasMaxLength(80);
            entity.HasIndex(device => device.PushToken).IsUnique();
            entity.HasIndex(device => new { device.UserId, device.RevokedAt, device.LastSeenAt });
            entity.HasOne(device => device.User)
                .WithMany()
                .HasForeignKey(device => device.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<HabitReminder>(entity =>
        {
            entity.ToTable("habit_reminders");
            entity.HasKey(reminder => reminder.Id);
            entity.Property(reminder => reminder.TimeZone).HasMaxLength(80).IsRequired();
            entity.Property(reminder => reminder.Channel).HasMaxLength(32).IsRequired();
            entity.Property(reminder => reminder.DaysOfWeek).HasMaxLength(32).IsRequired();
            entity.HasIndex(reminder => reminder.HabitId).IsUnique();
            entity.HasIndex(reminder => new { reminder.Enabled, reminder.Channel, reminder.TriggerTime });
            entity.HasOne(reminder => reminder.Habit)
                .WithOne(habit => habit.Reminder)
                .HasForeignKey<HabitReminder>(reminder => reminder.HabitId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<WeeklyReview>(entity =>
        {
            entity.ToTable("weekly_reviews");
            entity.HasKey(review => review.Id);
            entity.Property(review => review.WhatWorked).HasMaxLength(1000);
            entity.Property(review => review.WhatWasHard).HasMaxLength(1000);
            entity.Property(review => review.Adjustment).HasMaxLength(1000);
            entity.Property(review => review.Mood).HasMaxLength(64);
            entity.HasIndex(review => new { review.UserId, review.WeekStartOn }).IsUnique();
            entity.HasOne(review => review.User)
                .WithMany()
                .HasForeignKey(review => review.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
