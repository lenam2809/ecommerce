using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Serilog.Context;
using System.Diagnostics;

namespace Ecommerce.WebAPI.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;

        public RequestLoggingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var logger = scope.ServiceProvider.GetRequiredService<IEnhancedLogger>();
                var currentUserService = scope.ServiceProvider.GetService<ICurrentUserService>();
                
                var userId = currentUserService?.UserId?.ToString() ?? "anonymous";
                var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault() ?? Guid.NewGuid().ToString();
                var requestId = context.TraceIdentifier;

                using (LogContext.PushProperty("UserId", userId))
                using (LogContext.PushProperty("CorrelationId", correlationId))
                using (LogContext.PushProperty("RequestId", requestId))
                {
                    try
                    {
                        await logger.LogAsync(
                            ELogLevel.Information,
                            "HTTP {Method} {Path} started",
                            "RequestLoggingMiddleware",
                            properties: new Dictionary<string, object?>
                            {
                                { "Method", context.Request.Method },
                                { "Path", context.Request.Path.Value ?? "/" },
                                { "CorrelationId", correlationId },
                                { "RequestId", requestId },
                                { "UserId", userId }
                            });
                        var stopwatch = Stopwatch.StartNew();

                        await _next(context);

                        stopwatch.Stop();
                        await logger.LogAsync(
                            ELogLevel.Information,
                            "HTTP {Method} {Path} completed in {ExecutionTimeMs}ms with status {StatusCode}",
                            "RequestLoggingMiddleware",
                            properties: new Dictionary<string, object?>
                            {
                                { "Method", context.Request.Method },
                                { "Path", context.Request.Path.Value ?? "/" },
                                { "ExecutionTimeMs", stopwatch.ElapsedMilliseconds },
                                { "StatusCode", context.Response.StatusCode },
                                { "CorrelationId", correlationId },
                                { "RequestId", requestId },
                                { "UserId", userId }
                            });
                    }
                    catch (Exception ex)
                    {
                        await logger.LogExceptionAsync(
                            ex,
                            "RequestLoggingMiddleware",
                            new Dictionary<string, object?>
                            {
                                { "Method", context.Request.Method },
                                { "Path", context.Request.Path.Value ?? "/" },
                                { "CorrelationId", correlationId },
                                { "RequestId", requestId },
                                { "UserId", userId }
                            });
                        throw;
                    }
                }
            }
        }
    }

    // Extension method để dễ dàng sử dụng
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}

