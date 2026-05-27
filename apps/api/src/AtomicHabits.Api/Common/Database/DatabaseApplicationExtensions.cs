using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Common.Database;

public static class DatabaseApplicationExtensions
{
    public static async Task ApplyDatabaseMigrationsAsync(this WebApplication app)
    {
        if (app.Environment.IsEnvironment("Testing") ||
            !app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
        {
            return;
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AtomicHabitsDbContext>();
        await dbContext.Database.MigrateAsync();
    }
}
