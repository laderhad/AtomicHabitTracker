using Microsoft.EntityFrameworkCore;

namespace AtomicHabits.Api.Common.Database;

public static class DatabaseServiceCollectionExtensions
{
    public static IServiceCollection AddAtomicHabitsDatabase(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var provider = configuration.GetValue<string>("Database:Provider");

        services.AddDbContext<AtomicHabitsDbContext>(options =>
        {
            if (environment.IsEnvironment("Testing") ||
                string.Equals(provider, "InMemory", StringComparison.OrdinalIgnoreCase))
            {
                options.UseInMemoryDatabase("AtomicHabitsTests");
                return;
            }

            var connectionString = configuration.GetConnectionString("Default")
                ?? throw new InvalidOperationException("ConnectionStrings:Default is required.");

            options.UseNpgsql(connectionString);
        });

        return services;
    }
}
