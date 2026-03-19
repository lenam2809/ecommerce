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
                options.UseSqlServer(
                    connectionString,
                    sqlOptions => sqlOptions
                        .MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                        .UseCompatibilityLevel(120)
                        .EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null)
                )
            );

            return services;
        }
    }

}

