using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using System.Diagnostics;

namespace Ecommerce.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : notnull
    {
        private readonly IEnhancedLogger _logger;
        private readonly ICurrentUserService _currentUserService;

        public LoggingBehavior(IEnhancedLogger logger, ICurrentUserService currentUserService)
        {
            _logger = logger;
            _currentUserService = currentUserService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _currentUserService.UserId;
            var uniqueId = Guid.NewGuid().ToString();

            // 1. Log Start
            // Note: We deliberately DO NOT serialize the 'request' object to avoid logging sensitive data (passwords, PII)
            // If specific request details are needed, they should be logged selectively in the Handler.
            await _logger.LogAsync(
                ELogLevel.Information,
                "Handling {RequestType}",
                requestName,
                ELogType.Default,
                new Dictionary<string, object?>
                {
                    { "CorrelationId", uniqueId },
                    { "RequestType", requestName },
                    { "UserId", userId?.ToString() ?? "Anonymous" }
                });

            var timer = Stopwatch.StartNew();

            try
            {
                // 2. Execute
                var response = await next();

                timer.Stop();
                var elapsedMilliseconds = timer.ElapsedMilliseconds;

                // 3. Log Success
                if (elapsedMilliseconds > 500) // Warning for slow requests (> 500ms)
                {
                    await _logger.LogAsync(
                        ELogLevel.Warning,
                        "Handled {RequestType} in {ExecutionTimeMs}ms with outcome {Outcome}",
                        requestName,
                        ELogType.Performance,
                        new Dictionary<string, object?>
                        {
                            { "CorrelationId", uniqueId },
                            { "RequestType", requestName },
                            { "UserId", userId?.ToString() ?? "Anonymous" },
                            { "ExecutionTimeMs", elapsedMilliseconds },
                            { "Outcome", "Slow" }
                        });
                }
                else
                {
                    await _logger.LogAsync(
                        ELogLevel.Information,
                        "Handled {RequestType} in {ExecutionTimeMs}ms with outcome {Outcome}",
                        requestName,
                        ELogType.Default,
                        new Dictionary<string, object?>
                        {
                            { "CorrelationId", uniqueId },
                            { "RequestType", requestName },
                            { "UserId", userId?.ToString() ?? "Anonymous" },
                            { "ExecutionTimeMs", elapsedMilliseconds },
                            { "Outcome", "Success" }
                        });
                }

                return response;
            }
            catch (Exception ex)
            {
                timer.Stop();
                var elapsedMilliseconds = timer.ElapsedMilliseconds;

                // 4. Log Failure
                await _logger.LogExceptionAsync(
                    ex,
                    requestName,
                    new Dictionary<string, object?>
                    {
                        { "CorrelationId", uniqueId },
                        { "RequestType", requestName },
                        { "UserId", userId?.ToString() ?? "Anonymous" },
                        { "ExecutionTimeMs", elapsedMilliseconds },
                        { "Outcome", "Failed" }
                    });
                throw;
            }
        }
    }
}
