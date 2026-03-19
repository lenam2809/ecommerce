using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;

namespace Ecommerce.Infrastructure.Logging
{
    public class SeriLogger : ISeriLogger
    {
        private readonly ILogger _logger;

        public SeriLogger(ILogger logger)
        {
            _logger = logger;
        }

        public void LogDebug(string message)
        {
            _logger.Debug(message);
        }

        public void LogError(string message)
        {
            _logger.Error(message);
        }

        public void LogError(Exception exception, string message)
        {
            _logger.Error(exception, message);
        }

        public void LogInformation(string message)
        {
            _logger.Information(message);
        }

        public void LogWarning(string message)
        {
            _logger.Warning(message);
        }
    }

    public static class SerilogExtensions
    {
        public static IServiceCollection AddSerilog(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure Serilog
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(configuration)
                .Enrich.FromLogContext()
                .Enrich.WithExceptionDetails()
                .Enrich.WithMachineName()
                .Enrich.WithEnvironmentName()
                .WriteTo.Console()
                .WriteTo.File(
                    path: "logs/log-.txt",
                    rollingInterval: RollingInterval.Day,
                    restrictedToMinimumLevel: LogEventLevel.Information)
                .WriteTo.File(
                    path: "logs/error-.txt",
                    rollingInterval: RollingInterval.Day,
                    restrictedToMinimumLevel: LogEventLevel.Error)
                .CreateLogger();

            services.AddSingleton(Log.Logger);
            services.AddSingleton<ISeriLogger, SeriLogger>();

            return services;
        }
    }
}

