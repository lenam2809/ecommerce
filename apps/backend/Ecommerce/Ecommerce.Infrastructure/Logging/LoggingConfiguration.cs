using Ecommerce.Application.Common.Logging;
using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.Infrastructure.Logging
{
    public static class LoggingConfiguration
    {
        public static IServiceCollection AddCustomLogging(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddScoped<ILogRepository, LogRepository>();
            services.AddScoped<IAuditLogger, AuditLogRepository>();
            services.AddScoped<IPerformanceLogger, PerformanceLogRepository>();
            services.AddScoped<IEnhancedLogger, EnhancedLogger>();

            return services;
        }
    }
}

