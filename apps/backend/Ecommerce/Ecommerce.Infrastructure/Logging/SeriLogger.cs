using Ecommerce.Domain.Interfaces.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using Serilog.Exceptions;
using Serilog.Formatting.Json;
using System.Text.RegularExpressions;

namespace Ecommerce.Infrastructure.Logging
{
    public class SeriLogger : ISeriLogger
    {
        private static readonly Regex MessagePropertyRegex = new(@"\{(?<name>[^}:]+)(?:[^}]*)\}", RegexOptions.Compiled);
        private readonly Serilog.ILogger _logger;

        public SeriLogger(Serilog.ILogger logger)
        {
            _logger = logger;
        }

        public void LogDebug(string messageTemplate, IReadOnlyDictionary<string, object?>? properties = null)
        {
            Write(LogEventLevel.Debug, messageTemplate, properties);
        }

        public void LogError(string messageTemplate, IReadOnlyDictionary<string, object?>? properties = null)
        {
            Write(LogEventLevel.Error, messageTemplate, properties);
        }

        public void LogError(Exception exception, string messageTemplate, IReadOnlyDictionary<string, object?>? properties = null)
        {
            Write(LogEventLevel.Error, messageTemplate, properties, exception);
        }

        public void LogInformation(string messageTemplate, IReadOnlyDictionary<string, object?>? properties = null)
        {
            Write(LogEventLevel.Information, messageTemplate, properties);
        }

        public void LogWarning(string messageTemplate, IReadOnlyDictionary<string, object?>? properties = null)
        {
            Write(LogEventLevel.Warning, messageTemplate, properties);
        }

        private void Write(
            LogEventLevel level,
            string messageTemplate,
            IReadOnlyDictionary<string, object?>? properties,
            Exception? exception = null)
        {
            var contextualLogger = _logger;
            if (properties != null)
            {
                foreach (var property in properties)
                {
                    contextualLogger = contextualLogger.ForContext(property.Key, property.Value, destructureObjects: true);
                }
            }

            var values = BuildTemplateValues(messageTemplate, properties);
            if (exception == null)
            {
                contextualLogger.Write(level, messageTemplate, values);
                return;
            }

            contextualLogger.Write(level, exception, messageTemplate, values);
        }

        private static object?[] BuildTemplateValues(string messageTemplate, IReadOnlyDictionary<string, object?>? properties)
        {
            if (properties == null || properties.Count == 0)
            {
                return [];
            }

            return MessagePropertyRegex.Matches(messageTemplate)
                .Select(match => match.Groups["name"].Value.TrimStart('@', '$'))
                .Select(propertyName => properties.TryGetValue(propertyName, out var value) ? value : null)
                .ToArray();
        }
    }

    public static class SerilogExtensions
    {
        public static IServiceCollection AddSerilog(this IServiceCollection services, IConfiguration configuration)
        {
            var defaultLevel = ParseLogLevel(configuration["Serilog:MinimumLevel:Default"], LogEventLevel.Information);
            var microsoftLevel = ParseLogLevel(configuration["Serilog:MinimumLevel:Override:Microsoft"], LogEventLevel.Warning);
            var systemLevel = ParseLogLevel(configuration["Serilog:MinimumLevel:Override:System"], LogEventLevel.Warning);
            var jsonFormatter = new JsonFormatter(renderMessage: true);

            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Is(defaultLevel)
                .MinimumLevel.Override("Microsoft", microsoftLevel)
                .MinimumLevel.Override("System", systemLevel)
                .Enrich.FromLogContext()
                .Enrich.WithExceptionDetails()
                .Enrich.WithMachineName()
                .Enrich.WithEnvironmentName()
                .WriteTo.Console(jsonFormatter)
                .WriteTo.File(
                    formatter: jsonFormatter,
                    path: "logs/log-.json",
                    rollingInterval: RollingInterval.Day,
                    shared: true,
                    restrictedToMinimumLevel: LogEventLevel.Information)
                .WriteTo.File(
                    formatter: jsonFormatter,
                    path: "logs/error-.json",
                    rollingInterval: RollingInterval.Day,
                    shared: true,
                    restrictedToMinimumLevel: LogEventLevel.Error)
                .CreateLogger();

            services.AddLogging(builder =>
            {
                builder.ClearProviders();
                builder.AddSerilog(Log.Logger, dispose: false);
            });
            services.AddSingleton(Log.Logger);
            services.AddSingleton<ISeriLogger, SeriLogger>();

            return services;
        }

        private static LogEventLevel ParseLogLevel(string? configuredValue, LogEventLevel fallback)
        {
            return Enum.TryParse<LogEventLevel>(configuredValue, ignoreCase: true, out var parsed)
                ? parsed
                : fallback;
        }
    }
}
