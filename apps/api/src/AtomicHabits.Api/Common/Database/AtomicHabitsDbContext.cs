using AtomicHabits.Api.Common.Auth;
using AtomicHabits.Api.Features.Auth;
using AtomicHabits.Api.Features.Challenges;
using AtomicHabits.Api.Features.Devices;
using AtomicHabits.Api.Features.Gamification;
using AtomicHabits.Api.Features.HabitLogs;
using AtomicHabits.Api.Features.Habits;
using AtomicHabits.Api.Features.Reminders;
using AtomicHabits.Api.Features.Reviews;
using AtomicHabits.Api.Features.ShareCards;
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

    public DbSet<Challenge> Challenges => Set<Challenge>();

    public DbSet<ChallengeParticipant> ChallengeParticipants => Set<ChallengeParticipant>();

    public DbSet<ChallengeCheckIn> ChallengeCheckIns => Set<ChallengeCheckIn>();

    public DbSet<ShareCard> ShareCards => Set<ShareCard>();

    public DbSet<BadgeUnlock> BadgeUnlocks => Set<BadgeUnlock>();

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

        builder.Entity<Challenge>(entity =>
        {
            entity.ToTable("challenges");
            entity.HasKey(challenge => challenge.Id);
            entity.Property(challenge => challenge.Title).HasMaxLength(120).IsRequired();
            entity.Property(challenge => challenge.Description).HasMaxLength(600);
            entity.Property(challenge => challenge.Visibility).HasMaxLength(32).IsRequired();
            entity.Property(challenge => challenge.InviteCode).HasMaxLength(24).IsRequired();
            entity.HasIndex(challenge => challenge.InviteCode).IsUnique();
            entity.HasIndex(challenge => new { challenge.Visibility, challenge.StartAt, challenge.EndAt });
            entity.HasOne(challenge => challenge.CreatedByUser)
                .WithMany()
                .HasForeignKey(challenge => challenge.CreatedByUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ChallengeParticipant>(entity =>
        {
            entity.ToTable("challenge_participants");
            entity.HasKey(participant => participant.Id);
            entity.Property(participant => participant.Role).HasMaxLength(32).IsRequired();
            entity.HasIndex(participant => new { participant.ChallengeId, participant.UserId }).IsUnique();
            entity.HasIndex(participant => new { participant.UserId, participant.JoinedAt });
            entity.HasOne(participant => participant.Challenge)
                .WithMany(challenge => challenge.Participants)
                .HasForeignKey(participant => participant.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(participant => participant.User)
                .WithMany()
                .HasForeignKey(participant => participant.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ChallengeCheckIn>(entity =>
        {
            entity.ToTable("challenge_check_ins");
            entity.HasKey(checkIn => checkIn.Id);
            entity.HasIndex(checkIn => new { checkIn.ChallengeId, checkIn.HabitLogId }).IsUnique();
            entity.HasIndex(checkIn => new { checkIn.UserId, checkIn.CreatedAt });
            entity.HasOne(checkIn => checkIn.Challenge)
                .WithMany(challenge => challenge.CheckIns)
                .HasForeignKey(checkIn => checkIn.ChallengeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(checkIn => checkIn.User)
                .WithMany()
                .HasForeignKey(checkIn => checkIn.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(checkIn => checkIn.HabitLog)
                .WithMany()
                .HasForeignKey(checkIn => checkIn.HabitLogId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ShareCard>(entity =>
        {
            entity.ToTable("share_cards");
            entity.HasKey(shareCard => shareCard.Id);
            entity.Property(shareCard => shareCard.Type).HasMaxLength(32).IsRequired();
            entity.Property(shareCard => shareCard.Title).HasMaxLength(120).IsRequired();
            entity.Property(shareCard => shareCard.Subtitle).HasMaxLength(240);
            entity.Property(shareCard => shareCard.ImageUrl).HasMaxLength(512);
            entity.Property(shareCard => shareCard.DeepLink).HasMaxLength(512).IsRequired();
            entity.Property(shareCard => shareCard.PayloadJson).HasColumnType("jsonb");
            entity.HasIndex(shareCard => new { shareCard.UserId, shareCard.CreatedAt });
            entity.HasOne(shareCard => shareCard.User)
                .WithMany()
                .HasForeignKey(shareCard => shareCard.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BadgeUnlock>(entity =>
        {
            entity.ToTable("badge_unlocks");
            entity.HasKey(unlock => unlock.Id);
            entity.Property(unlock => unlock.BadgeCode).HasMaxLength(64).IsRequired();
            entity.Property(unlock => unlock.ContextJson).HasColumnType("jsonb");
            entity.HasIndex(unlock => new { unlock.UserId, unlock.BadgeCode }).IsUnique();
            entity.HasIndex(unlock => new { unlock.UserId, unlock.UnlockedAt });
            entity.HasIndex(unlock => new { unlock.UserId, unlock.SeenAt, unlock.UnlockedAt });
            entity.HasOne(unlock => unlock.User)
                .WithMany()
                .HasForeignKey(unlock => unlock.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
