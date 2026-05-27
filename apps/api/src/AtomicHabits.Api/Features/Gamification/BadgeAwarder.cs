using System.Text.Json;
using AtomicHabits.Api.Common.Database;
using AtomicHabits.Api.Common.Time;
using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Features.Gamification;

public interface IBadgeAwarder
{
    Task AwardAsync(
        Guid userId,
        IReadOnlyCollection<BadgeAward> awards,
        CancellationToken cancellationToken);
}

public sealed record BadgeAward(string BadgeCode, object Context);

public sealed class BadgeAwarder(
    AtomicHabitsDbContext dbContext,
    IClock clock) : IBadgeAwarder
{
    public async Task AwardAsync(
        Guid userId,
        IReadOnlyCollection<BadgeAward> awards,
        CancellationToken cancellationToken)
    {
        var validAwards = awards
            .Where(award => BadgeCatalog.Find(award.BadgeCode) is not null)
            .GroupBy(award => award.BadgeCode)
            .Select(group => group.First())
            .ToArray();

        if (validAwards.Length == 0)
        {
            return;
        }

        var requestedCodes = validAwards.Select(award => award.BadgeCode).ToArray();
        var existingCodes = await dbContext.BadgeUnlocks
            .Where(unlock => unlock.UserId == userId && requestedCodes.Contains(unlock.BadgeCode))
            .Select(unlock => unlock.BadgeCode)
            .ToListAsync(cancellationToken);

        var existingCodeSet = existingCodes.ToHashSet(StringComparer.Ordinal);
        var now = clock.UtcNow;

        foreach (var award in validAwards)
        {
            if (existingCodeSet.Contains(award.BadgeCode))
            {
                continue;
            }

            dbContext.BadgeUnlocks.Add(new BadgeUnlock
            {
                UserId = userId,
                BadgeCode = award.BadgeCode,
                ContextJson = JsonSerializer.Serialize(award.Context),
                UnlockedAt = now
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
