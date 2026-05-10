using Ecommerce.Application.Common.Interfaces;
using Ecommerce.WebAPI.Configuration;
using Microsoft.Extensions.Options;
using Serilog.Context;
using System.Diagnostics;
using System.Security.Claims;

namespace Ecommerce.WebAPI.Middleware
{
    public class GlobalLogEnrichmentMiddleware
    {
        public const string CorrelationIdItemKey = "CorrelationId";

        private readonly RequestDelegate _next;
        private readonly RequestLoggingOptions _options;
        private readonly IHostEnvironment _environment;

        public GlobalLogEnrichmentMiddleware(
            RequestDelegate next,
            IOptions<RequestLoggingOptions> options,
            IHostEnvironment environment)
        {
            _next = next;
            _options = options.Value;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var currentUserService = context.RequestServices.GetService<ICurrentUserService>();

            var correlationId = ResolveCorrelationId(context);
            var userId = currentUserService?.UserId?.ToString() ?? "anonymous";
            var userName = ResolveUserName(context, currentUserService);
            var clientIp = ResolveClientIp(context);
            var userAgent = context.Request.Headers.UserAgent.ToString();
            var activity = Activity.Current;
            var traceId = activity?.TraceId.ToString();
            var spanId = activity?.SpanId.ToString();

            context.Items[CorrelationIdItemKey] = correlationId;
            context.Response.Headers[_options.CorrelationIdHeaderName] = correlationId;
            context.Response.Headers["X-Trace-ID"] = traceId;
            context.Response.Headers["X-Span-ID"] = spanId;

            activity?.SetTag("correlation.id", correlationId);
            activity?.SetBaggage("correlation.id", correlationId);

            using (LogContext.PushProperty("CorrelationId", correlationId))
            using (LogContext.PushProperty("TraceId", traceId))
            using (LogContext.PushProperty("SpanId", spanId))
            using (LogContext.PushProperty("RequestId", context.TraceIdentifier))
            using (LogContext.PushProperty("UserId", userId))
            using (LogContext.PushProperty("UserName", userName))
            using (LogContext.PushProperty("ClientIP", clientIp))
            using (LogContext.PushProperty("UserAgent", userAgent))
            using (LogContext.PushProperty("EnvironmentName", _environment.EnvironmentName))
            using (LogContext.PushProperty("MachineName", Environment.MachineName))
            {
                await _next(context);
            }
        }

        private string ResolveCorrelationId(HttpContext context)
        {
            var headerValue = context.Request.Headers[_options.CorrelationIdHeaderName].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(headerValue))
            {
                return headerValue;
            }

            if (context.Items.TryGetValue(CorrelationIdItemKey, out var existingCorrelationId) &&
                existingCorrelationId is string correlationId &&
                !string.IsNullOrWhiteSpace(correlationId))
            {
                return correlationId;
            }

            return Guid.NewGuid().ToString("N");
        }

        private static string ResolveUserName(HttpContext context, ICurrentUserService? currentUserService)
        {
            if (!string.IsNullOrWhiteSpace(currentUserService?.FullName))
            {
                return currentUserService.FullName;
            }

            var user = context.User;
            return user.FindFirstValue(ClaimTypes.Name)
                ?? user.FindFirstValue(ClaimTypes.Email)
                ?? user.Identity?.Name
                ?? "anonymous";
        }

        private static string ResolveClientIp(HttpContext context)
        {
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(forwardedFor))
            {
                return forwardedFor.Split(',')[0].Trim();
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }
    }

    public static class GlobalLogEnrichmentMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalLogEnrichment(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<GlobalLogEnrichmentMiddleware>();
        }
    }
}
