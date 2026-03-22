using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class LoggingBackgroundWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<LoggingBackgroundWorker> _logger;
        private readonly ILogRepository _logRepository;
        private readonly IPerformanceLogger _performanceLogger;
        private readonly IAuditLogger _auditLogger;

        public LoggingBackgroundWorker(
            IServiceProvider serviceProvider,
            ILogger<LoggingBackgroundWorker> logger,
            ILogRepository logRepository,
            IPerformanceLogger performanceLogger,
            IAuditLogger auditLogger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _logRepository = logRepository;
            _performanceLogger = performanceLogger;
            _auditLogger = auditLogger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Logging Background Worker is starting.");

            var logTask = ProcessLogsAsync(stoppingToken);
            var performanceTask = ProcessPerformanceLogsAsync(stoppingToken);
            var auditTask = ProcessAuditLogsAsync(stoppingToken);

            await Task.WhenAll(logTask, performanceTask, auditTask);
        }

        private async Task ProcessLogsAsync(CancellationToken stoppingToken)
        {
            if (_logRepository is LogRepository repository)
            {
                try
                {
                    await foreach (var log in repository.Reader.ReadAllAsync(stoppingToken))
                    {
                        await ExecuteInScopeAsync(async context =>
                        {
                            var dbLog = new LogEntry
                            {
                                Level = log.Level,
                                Message = log.Message,
                                EventName = log.EventName,
                                SourceContext = log.SourceContext,
                                ApplicationUserId = log.ApplicationUserId,
                                IpAddress = log.IpAddress,
                                Timestamp = log.Timestamp,
                                Properties = log.Properties
                            };
                            context.LogEntries.Add(dbLog);
                            await context.SaveChangesAsync(stoppingToken);
                        });
                    }
                }
                catch (OperationCanceledException) { }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing log queue");
                }
            }
        }

        private async Task ProcessPerformanceLogsAsync(CancellationToken stoppingToken)
        {
            if (_performanceLogger is PerformanceLogRepository repository)
            {
                try
                {
                    await foreach (var log in repository.Reader.ReadAllAsync(stoppingToken))
                    {
                        await ExecuteInScopeAsync(async context =>
                        {
                            context.PerformanceLogs.Add(log);
                            await context.SaveChangesAsync(stoppingToken);
                        });
                    }
                }
                catch (OperationCanceledException) { }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing performance log queue");
                }
            }
        }

        private async Task ProcessAuditLogsAsync(CancellationToken stoppingToken)
        {
            if (_auditLogger is AuditLogRepository repository)
            {
                try
                {
                    await foreach (var log in repository.Reader.ReadAllAsync(stoppingToken))
                    {
                        await ExecuteInScopeAsync(async context =>
                        {
                            context.AuditLogs.Add(log);
                            await context.SaveChangesAsync(stoppingToken);
                        });
                    }
                }
                catch (OperationCanceledException) { }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing audit log queue");
                }
            }
        }

        private async Task ExecuteInScopeAsync(Func<ApplicationDbContext, Task> action)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await action(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while persisting logs to database.");
            }
        }
    }
}
