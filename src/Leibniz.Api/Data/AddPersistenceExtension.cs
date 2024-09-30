namespace Leibniz.Api.Data;
public static class AddPersistenceExtension
{
    public static IServiceCollection AddPersistence(
    this IServiceCollection services, IConfiguration configuration,
    bool unitTestMode = false)
    {
        var dataConfiguration = configuration.GetSection(nameof(DataConfiguration)).Get<DataConfiguration>();
        services.Configure<DataConfiguration>(configuration.GetSection(nameof(DataConfiguration)));

        if (!string.IsNullOrEmpty(dataConfiguration.ConnectionString))
        {
            services.AddDbContext<AcademyDbContext>(options =>
                options
                .UseSqlServer(dataConfiguration.ConnectionString, x => x.UseCompatibilityLevel(120))
                .EnableSensitiveDataLogging());

            // Run DB Migrations
            var provider = services.BuildServiceProvider();
            var context = provider.GetRequiredService<AcademyDbContext>();
            if (dataConfiguration.RunMigrations)
            {
                context.Database.SetCommandTimeout(TimeSpan.FromMinutes(5));
                context.Database.Migrate();
            }
        }
        else
        {
            var databaseName = unitTestMode ?
                $"Leibniz.Api.EmptyDatabase-{Guid.NewGuid()}" :
                $"Leibniz.Api.EmptyDatabase";
            services.AddDbContext<AcademyDbContext>(options =>
                options.UseInMemoryDatabase(databaseName));
        }
        return services;
    }

}
