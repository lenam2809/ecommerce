using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
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
                try
                {
                    await logger.LogAsync(ELogLevel.Information,
                        $"HTTP {context.Request.Method} {context.Request.Path} started",
                        "RequestLoggingMiddleware");
                    var stopwatch = Stopwatch.StartNew();

                    await _next(context);

                    stopwatch.Stop();
                    await logger.LogAsync(ELogLevel.Information,
                        $"HTTP {context.Request.Method} {context.Request.Path} completed in {stopwatch.ElapsedMilliseconds}ms with status {context.Response.StatusCode}",
                        "RequestLoggingMiddleware");
                }
                catch (Exception ex)
                {
                    await logger.LogExceptionAsync(ex,
                        $"HTTP {context.Request.Method} {context.Request.Path} failed");
                    throw;
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

