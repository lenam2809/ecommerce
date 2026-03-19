using Ecommerce.Infrastructure.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddDatabase(configuration)
                .AddIdentityServices()
                .AddJwtAuthentication(configuration)
                .AddAuthorizationPolicies()
                .AddLogging(configuration)
                .AddCaching(configuration)
                .AddElasticsearch(configuration)
                .AddRepositories()
                .AddCustomServices(configuration);

            return services;
        }
    }
}

