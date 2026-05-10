using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Logging
{
    public class LogRetentionCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;
        private readonly ILogger<LogRetentionCleanupService> _logger;

        public LogRetentionCleanupService(
            IServiceProvider serviceProvider,
            IConfiguration configuration,
            ILogger<LogRetentionCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CleanupAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }

        private async Task CleanupAsync(CancellationToken stoppingToken)
        {
            try
            {
                var informationDays = ParsePositiveInt(_configuration["Serilog:Retention:InformationDays"], 14);
                var errorDays = ParsePositiveInt(_configuration["Serilog:Retention:ErrorDays"], 90);
                var performanceDays = ParsePositiveInt(_configuration["Serilog:Retention:PerformanceDays"], 30);

                var now = DateTime.UtcNow;
                var informationCutoff = now.AddDays(-informationDays);
                var errorCutoff = now.AddDays(-errorDays);
                var performanceCutoff = now.AddDays(-performanceDays);

                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var deletedInformationLogs = await context.LogEntries
                    .Where(log => log.Timestamp < informationCutoff && log.Level < ELogLevel.Error)
                    .ExecuteDeleteAsync(stoppingToken);

                var deletedErrorLogs = await context.LogEntries
                    .Where(log => log.Timestamp < errorCutoff && log.Level >= ELogLevel.Error)
                    .ExecuteDeleteAsync(stoppingToken);

                var deletedPerformanceLogs = await context.PerformanceLogs
                    .Where(log => log.CreatedAt < performanceCutoff)
                    .ExecuteDeleteAsync(stoppingToken);

                if (deletedInformationLogs > 0 || deletedErrorLogs > 0 || deletedPerformanceLogs > 0)
                {
                    _logger.LogInformation(
                        "Log retention cleanup deleted {InformationLogCount} information logs, {ErrorLogCount} error logs, {PerformanceLogCount} performance logs",
                        deletedInformationLogs,
                        deletedErrorLogs,
                        deletedPerformanceLogs);
                }
            }
            catch (OperationCanceledException)
            {
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Log retention cleanup failed");
            }
        }

        private static int ParsePositiveInt(string? configuredValue, int fallback)
        {
            return int.TryParse(configuredValue, out var parsed) && parsed > 0
                ? parsed
                : fallback;
        }
    }
}
