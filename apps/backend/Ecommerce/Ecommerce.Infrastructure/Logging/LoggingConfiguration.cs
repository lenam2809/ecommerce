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
            services.AddSingleton<ILogRepository, LogRepository>();
            services.AddSingleton<IAuditLogger, AuditLogRepository>();
            services.AddSingleton<IPerformanceLogger, PerformanceLogRepository>();
            services.AddSingleton<ILogSanitizer, LogSanitizer>();
            services.AddScoped<IEnhancedLogger, EnhancedLogger>();

            services.AddHostedService<LoggingBackgroundWorker>();
            services.AddHostedService<LogRetentionCleanupService>();

            return services;
        }
    }
}

