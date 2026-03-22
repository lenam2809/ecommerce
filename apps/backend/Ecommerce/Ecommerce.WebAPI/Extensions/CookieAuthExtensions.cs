using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Ecommerce.WebAPI.Extensions
{
    /// <summary>
    /// Extension methods for managing httpOnly authentication cookies
    /// </summary>
    public static class CookieAuthExtensions
    {
        private const string AccessTokenCookieName = "access_token";
        private const string RefreshTokenCookieName = "refresh_token";
        private const string CsrfTokenCookieName = "csrf_token";

        /// <summary>
        /// Set authentication cookies (access_token and refresh_token) with httpOnly flag
        /// </summary>
        public static void SetAuthCookies(this HttpResponse response, string accessToken, string refreshToken, IConfiguration? config = null)
        {
            var isLocalhost = IsLocalhost(response.HttpContext);
            var cookieSettings = config?.GetSection("CookieSettings");

            // For cross-domain production (Render/Railway), we NEED SameSite=None and Secure=true
            // For localhost, Lax and Secure=false is easier for development
            var sameSite = isLocalhost ? SameSiteMode.Lax : SameSiteMode.None;
            var secure = !isLocalhost || (cookieSettings?.GetValue<bool>("ForceSecure") ?? false);

            // Access Token Cookie
            var accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,                    // Not accessible via JavaScript
                Secure = secure,
                SameSite = sameSite,
                Path = "/",                       // Accessible for entire domain
                Expires = DateTimeOffset.UtcNow.AddMinutes(
                    cookieSettings?.GetValue<int>("AccessTokenMinutes") ?? 15
                )
            };

            // Set domain for production if specified
            var domain = cookieSettings?.GetValue<string>("Domain");
            if (!string.IsNullOrEmpty(domain) && !isLocalhost)
            {
                accessTokenOptions.Domain = domain;
            }

            // Refresh Token Cookie
            var refreshTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = sameSite,
                Path = "/api",                  // Sent to all /api/* routes (including /api/auth/refresh-token)
                Expires = DateTimeOffset.UtcNow.AddDays(
                    cookieSettings?.GetValue<int>("RefreshTokenDays") ?? 7
                )
            };

            if (!string.IsNullOrEmpty(domain) && !isLocalhost)
            {
                refreshTokenOptions.Domain = domain;
            }

            response.Cookies.Append(AccessTokenCookieName, accessToken, accessTokenOptions);
            response.Cookies.Append(RefreshTokenCookieName, refreshToken, refreshTokenOptions);
        }

        /// <summary>
        /// Set CSRF token cookie (non-httpOnly so frontend can read it)
        /// </summary>
        public static void SetCsrfCookie(this HttpResponse response, IConfiguration? config = null)
        {
            var isLocalhost = IsLocalhost(response.HttpContext);
            var csrfToken = Guid.NewGuid().ToString("N");
            
            var sameSite = isLocalhost ? SameSiteMode.Lax : SameSiteMode.None;
            var secure = !isLocalhost || (config?.GetSection("CookieSettings").GetValue<bool>("ForceSecure") ?? false);

            var csrfOptions = new CookieOptions
            {
                HttpOnly = false,                    // Frontend needs to read this
                Secure = secure,
                SameSite = sameSite,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddHours(24)
            };

            response.Cookies.Append(CsrfTokenCookieName, csrfToken, csrfOptions);
        }

        /// <summary>
        /// Clear all authentication cookies
        /// </summary>
        public static void ClearAuthCookies(this HttpResponse response, IConfiguration? config = null)
        {
            var isLocalhost = IsLocalhost(response.HttpContext);
            var domain = config?.GetSection("CookieSettings").GetValue<string>("Domain");
            
            var sameSite = isLocalhost ? SameSiteMode.Lax : SameSiteMode.None;
            var secure = !isLocalhost || (config?.GetSection("CookieSettings").GetValue<bool>("ForceSecure") ?? false);

            var accessClearOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = sameSite,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(-1)  // Immediate expiry
            };

            var refreshClearOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = secure,
                SameSite = sameSite,
                Path = "/api",
                Expires = DateTimeOffset.UtcNow.AddDays(-1)
            };

            var csrfClearOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = secure,
                SameSite = sameSite,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddDays(-1)
            };

            if (!string.IsNullOrEmpty(domain) && !isLocalhost)
            {
                accessClearOptions.Domain = domain;
                refreshClearOptions.Domain = domain;
            }

            response.Cookies.Delete(AccessTokenCookieName, accessClearOptions);
            response.Cookies.Delete(RefreshTokenCookieName, refreshClearOptions);
            response.Cookies.Delete(CsrfTokenCookieName, csrfClearOptions);
        }

        /// <summary>
        /// Get access token from cookie
        /// </summary>
        public static string? GetAccessTokenFromCookie(this HttpRequest request)
        {
            return request.Cookies[AccessTokenCookieName];
        }

        /// <summary>
        /// Get refresh token from cookie
        /// </summary>
        public static string? GetRefreshTokenFromCookie(this HttpRequest request)
        {
            return request.Cookies[RefreshTokenCookieName];
        }

        /// <summary>
        /// Get CSRF token from cookie
        /// </summary>
        public static string? GetCsrfTokenFromCookie(this HttpRequest request)
        {
            return request.Cookies[CsrfTokenCookieName];
        }

        /// <summary>
        /// Check if the request is from localhost
        /// </summary>
        private static bool IsLocalhost(HttpContext context)
        {
            var host = context.Request.Host.Host.ToLower();
            return host == "localhost" || host == "127.0.0.1" || host == "::1";
        }
    }
}
