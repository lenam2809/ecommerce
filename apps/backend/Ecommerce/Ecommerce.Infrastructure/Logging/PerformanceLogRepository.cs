using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class PerformanceLogRepository : IPerformanceLogger
    {
        private readonly ApplicationDbContext _context;
        private readonly Channel<PerformanceLog> _performanceChannel;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<PerformanceLogRepository> _logger;

        public PerformanceLogRepository(
            ApplicationDbContext context,
            ICurrentUserService currentUserService,
            ILogger<PerformanceLogRepository> logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
            _performanceChannel = Channel.CreateUnbounded<PerformanceLog>();
            _ = ProcessPerformanceQueueAsync();
        }

        public async Task LogPerformanceAsync(
            string methodName,
            string className,
            long executionTimeMs,
            Guid? userId = null)
        {
            // Log warning for long-running methods
            if (executionTimeMs > 1000)
            {
                _logger.LogWarning(
                    "Long-running method: {ClassName}.{MethodName} took {ExecutionTime}ms",
                    className, methodName, executionTimeMs);
            }

            var performanceLog = new PerformanceLog
            {
                MethodName = methodName,
                ClassName = className,
                ExecutionTimeMilliseconds = executionTimeMs,
                StartTime = DateTime.Now.AddMilliseconds(-executionTimeMs),
                EndTime = DateTime.Now,
                UserId = userId ?? _currentUserService.UserId
            };

            await _performanceChannel.Writer.WriteAsync(performanceLog);
        }

        private async Task ProcessPerformanceQueueAsync()
        {
            await foreach (var performanceLog in _performanceChannel.Reader.ReadAllAsync())
            {
                try
                {
                    _context.PerformanceLogs.Add(performanceLog);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Performance log failed: {ex.Message}");
                }
            }
        }
    }
}

