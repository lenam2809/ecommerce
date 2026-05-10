using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Observability;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Diagnostics.Metrics;
using System.Threading.Channels;

namespace Ecommerce.Infrastructure.Logging
{
    public class PerformanceLogRepository : IPerformanceLogger
    {
        private readonly Channel<PerformanceLog> _performanceChannel;
        private readonly ILogger<PerformanceLogRepository> _logger;
        public ChannelReader<PerformanceLog> Reader => _performanceChannel.Reader;

        public PerformanceLogRepository(ILogger<PerformanceLogRepository> logger)
        {
            _logger = logger;
            _performanceChannel = Channel.CreateUnbounded<PerformanceLog>();
        }

        public async Task LogPerformanceAsync(
            string methodName,
            string className,
            long executionTimeMs,
            Guid? userId = null)
        {
            var activity = Activity.Current;
            var metricTags = new TagList
            {
                { "class_name", className },
                { "method_name", methodName }
            };

            EcommerceDiagnostics.MethodExecutionDuration.Record(executionTimeMs, metricTags);

            // Log warning for long-running methods
            if (executionTimeMs > 1000)
            {
                EcommerceDiagnostics.SlowMethods.Add(1, metricTags);
                _logger.LogWarning(
                    "Long-running method: {ClassName}.{MethodName} took {ExecutionTime}ms TraceId={TraceId} SpanId={SpanId}",
                    className,
                    methodName,
                    executionTimeMs,
                    activity?.TraceId.ToString(),
                    activity?.SpanId.ToString());
            }

            var performanceLog = new PerformanceLog
            {
                MethodName = methodName,
                ClassName = className,
                ExecutionTimeMilliseconds = executionTimeMs,
                StartTime = DateTime.Now.AddMilliseconds(-executionTimeMs),
                EndTime = DateTime.Now,
                UserId = userId
            };

            await _performanceChannel.Writer.WriteAsync(performanceLog);
        }
    }
}

