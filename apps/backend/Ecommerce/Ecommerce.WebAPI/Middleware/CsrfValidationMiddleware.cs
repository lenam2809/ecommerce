using Microsoft.Extensions.Options;
using Ecommerce.Application.Common.Configs;

namespace Ecommerce.WebAPI.Middleware
{
    /// <summary>
    /// Middleware to validate CSRF tokens using Double Submit Cookie pattern
    /// </summary>
    public class CsrfValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CsrfValidationMiddleware> _logger;
        private static readonly string[] SafeMethods = { "GET", "HEAD", "OPTIONS", "TRACE" };
        private const string CsrfCookieName = "csrf_token";
        private const string CsrfHeaderName = "X-CSRF-Token";

        public CsrfValidationMiddleware(RequestDelegate next, ILogger<CsrfValidationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IOptions<AuthConfig> authConfig)
        {
            // Skip if CSRF validation is disabled
            if (!authConfig.Value.EnableCsrfProtection)
            {
                await _next(context);
                return;
            }

            // Skip safe methods (GET, HEAD, OPTIONS, TRACE)
            if (SafeMethods.Contains(context.Request.Method, StringComparer.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // Skip if no auth cookie present (public endpoints)
            if (!context.Request.Cookies.ContainsKey("access_token"))
            {
                await _next(context);
                return;
            }

            // Skip certain paths that don't need CSRF
            // - /auth/login: không có cookie lúc đăng nhập lần đầu nên đã được xử lý bởi kiểm tra access_token bên trên
            // - /auth/register: public endpoint không có cookie
            // - /auth/refresh-token: có refresh_token cookie => phải validate CSRF
            // - /auth/logout: có access_token cookie => phải validate CSRF
            var path = context.Request.Path.Value?.ToLower() ?? "";
            if (path.Contains("/auth/register") ||
                path.Contains("/auth/forgot-password") ||
                path.Contains("/auth/reset-password") ||
                path.Contains("/auth/external-login") ||
                path.Contains("/auth/login"))
            {
                // Public endpoints - không có access_token cookie nên skip là đúng
                // Tuy nhiên: register/forgot-password tự thân đã được skip vì
                // chúản client không gửi access_token cookie khi chưa login.
                // Giữ đại đây để explicit rõ ràng.
                await _next(context);
                return;
            }

            // Validate CSRF token
            var cookieToken = context.Request.Cookies[CsrfCookieName];
            var headerToken = context.Request.Headers[CsrfHeaderName].FirstOrDefault();

            if (string.IsNullOrEmpty(cookieToken))
            {
                _logger.LogWarning("CSRF validation failed: Missing CSRF cookie. Path: {Path}", path);
                await RespondWithCsrfError(context, "CSRF cookie không tồn tại");
                return;
            }

            if (string.IsNullOrEmpty(headerToken))
            {
                _logger.LogWarning("CSRF validation failed: Missing CSRF header. Path: {Path}", path);
                await RespondWithCsrfError(context, "Thiếu CSRF token trong header");
                return;
            }

            if (!string.Equals(cookieToken, headerToken, StringComparison.Ordinal))
            {
                _logger.LogWarning("CSRF validation failed: Token mismatch. Path: {Path}", path);
                await RespondWithCsrfError(context, "CSRF token không hợp lệ");
                return;
            }

            await _next(context);
        }

        private static async Task RespondWithCsrfError(HttpContext context, string message)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                success = false,
                message = message,
                errorCode = "CSRF_VALIDATION_FAILED"
            });
        }
    }

    /// <summary>
    /// Extension method to register CSRF middleware
    /// </summary>
    public static class CsrfMiddlewareExtensions
    {
        public static IApplicationBuilder UseCsrfValidation(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CsrfValidationMiddleware>();
        }
    }
}
