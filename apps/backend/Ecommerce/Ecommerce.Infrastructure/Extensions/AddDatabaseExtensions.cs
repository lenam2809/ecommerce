using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddDatabaseExtensions
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new Exception("Connection string 'DefaultConnection' is null or empty.");
            }

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                // SQLite (local dev)
                if (connectionString.Contains("Data Source"))
                {
                    options.UseSqlite(connectionString, sqliteOptions =>
                    {
                        sqliteOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    });
                }
                else
                {
                    // PostgreSQL (Supabase / Render / production)
                    options.UseNpgsql(connectionString, npgsqlOptions =>
                    {
                        npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);

                        // 🔥 FIX TIMEOUT (quan trọng nhất cho Supabase)
                        npgsqlOptions.CommandTimeout(120);

                        // 🔥 RETRY khi DB cold start (Supabase free tier)
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(10),
                            errorCodesToAdd: null
                        );
                    });
                }

                // 🔥 (Optional) Log query khi debug
#if DEBUG
                options.EnableSensitiveDataLogging();
                options.EnableDetailedErrors();
#endif
            });

            return services;
        }
    }
}