using Ecommerce.Infrastructure.Extensions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration,
            bool requireHttpsMetadata = true)
        {
            services
                .AddDatabase(configuration)
                .AddIdentityServices()
                .AddJwtAuthentication(configuration, requireHttpsMetadata)
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

