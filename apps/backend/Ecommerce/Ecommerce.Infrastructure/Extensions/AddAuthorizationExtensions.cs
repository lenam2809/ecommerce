using Ecommerce.Application.Policies;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddAuthorizationExtensions
    {
        public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                AuthorizationPolicies.ConfigurePolicies(options);
            });

            return services;
        }
    }

}

