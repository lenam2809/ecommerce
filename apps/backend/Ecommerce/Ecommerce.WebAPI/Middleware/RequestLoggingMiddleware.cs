using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.WebAPI.Configuration;
using Microsoft.Extensions.Options;
using System.Diagnostics;

namespace Ecommerce.WebAPI.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly RequestLoggingOptions _options;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            IOptions<RequestLoggingOptions> options)
        {
            _next = next;
            _options = options.Value;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var logger = context.RequestServices.GetRequiredService<IEnhancedLogger>();
            var stopwatch = Stopwatch.StartNew();

            await _next(context);

            stopwatch.Stop();

            var statusCode = context.Response.StatusCode;
            var isImportantAction = MatchesAnyRule(context, _options.ImportantInformationRules);
            var samplingRate = GetSamplingRate(context, statusCode);

            if (!ShouldLogSuccess(statusCode, isImportantAction, samplingRate))
            {
                return;
            }

            var level = statusCode switch
            {
                >= StatusCodes.Status500InternalServerError => ELogLevel.Error,
                >= StatusCodes.Status400BadRequest => ELogLevel.Warning,
                _ => ELogLevel.Information
            };

            var eventName = isImportantAction
                ? "BusinessActionRequest"
                : statusCode >= StatusCodes.Status400BadRequest
                    ? "FailedHttpRequest"
                    : samplingRate.HasValue
                        ? "SampledHttpRequest"
                        : "HttpRequest";

            var properties = new Dictionary<string, object?>
            {
                { "Method", context.Request.Method },
                { "Path", context.Request.Path.Value ?? "/" },
                { "StatusCode", statusCode },
                { "ExecutionTimeMs", stopwatch.ElapsedMilliseconds },
                { "RequestQueryString", context.Request.QueryString.HasValue ? context.Request.QueryString.Value : null },
                { "IsImportantAction", isImportantAction }
            };

            if (samplingRate.HasValue)
            {
                properties["SuccessSampleRate"] = samplingRate.Value;
            }

            await logger.LogAsync(
                level,
                "HTTP {Method} {Path} completed in {ExecutionTimeMs}ms with status {StatusCode}",
                eventName,
                properties: properties);
        }

        private bool ShouldLogSuccess(int statusCode, bool isImportantAction, double? samplingRate)
        {
            if (statusCode >= StatusCodes.Status400BadRequest || isImportantAction)
            {
                return true;
            }

            if (samplingRate.HasValue)
            {
                return samplingRate.Value >= 1d || Random.Shared.NextDouble() <= samplingRate.Value;
            }

            return _options.LogSuccessfulRequests;
        }

        private double? GetSamplingRate(HttpContext context, int statusCode)
        {
            if (statusCode != StatusCodes.Status200OK)
            {
                return null;
            }

            foreach (var rule in _options.NoisySuccessSamplingRules)
            {
                if (MatchesRule(context, rule))
                {
                    return Math.Clamp(rule.SuccessSampleRate, 0d, 1d);
                }
            }

            return null;
        }

        private static bool MatchesAnyRule(HttpContext context, IEnumerable<RequestLoggingRuleOptions> rules)
        {
            return rules.Any(rule => MatchesRule(context, rule));
        }

        private static bool MatchesRule(HttpContext context, RequestLoggingRuleOptions rule)
        {
            if (!string.IsNullOrWhiteSpace(rule.Method) &&
                !string.Equals(context.Request.Method, rule.Method, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(rule.PathPrefix))
            {
                return false;
            }

            return context.Request.Path.StartsWithSegments(
                new PathString(rule.PathPrefix),
                StringComparison.OrdinalIgnoreCase);
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

