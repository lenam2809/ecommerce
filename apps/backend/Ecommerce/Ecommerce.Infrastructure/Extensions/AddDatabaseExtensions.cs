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
            var connectionString = configuration["ConnectionStrings:DefaultConnection"];

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                if (connectionString.Contains("Data Source"))
                {
                    options.UseSqlite(connectionString,
                        sqliteOptions => sqliteOptions
                            .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
                }
                else
                {
                    options.UseNpgsql(
                        connectionString,
                        npgsqlOptions => npgsqlOptions
                            .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                            .EnableRetryOnFailure(
                                maxRetryCount: 5,
                                maxRetryDelay: TimeSpan.FromSeconds(30),
                                errorCodesToAdd: null)
                    );
                }
            });

            return services;
        }
    }

}

