namespace Ecommerce.Application.Common.Configs
{
    /// <summary>
    /// Configuration for authentication behavior and feature flags
    /// </summary>
    public class AuthConfig
    {
        /// <summary>
        /// Enable cookie-based authentication (httpOnly cookies)
        /// </summary>
        public bool UseCookieAuth { get; set; } = true;

        /// <summary>
        /// Allow Authorization header as fallback during transition period
        /// Set to false after migration is complete
        /// </summary>
        public bool AllowHeaderFallback { get; set; } = true;

        /// <summary>
        /// Enable CSRF protection for cookie-based auth
        /// </summary>
        public bool EnableCsrfProtection { get; set; } = true;

        /// <summary>
        /// Include tokens in response body (for backward compatibility)
        /// Set to false after frontend migration is complete
        /// </summary>
        public bool IncludeTokensInResponse { get; set; } = true;
    }

    /// <summary>
    /// Configuration for cookie settings
    /// </summary>
    public class CookieSettings
    {
        /// <summary>
        /// Force Secure flag even on localhost (for testing)
        /// </summary>
        public bool ForceSecure { get; set; } = false;

        /// <summary>
        /// Access token expiration in minutes
        /// </summary>
        public int AccessTokenMinutes { get; set; } = 15;

        /// <summary>
        /// Refresh token expiration in days
        /// </summary>
        public int RefreshTokenDays { get; set; } = 7;

        /// <summary>
        /// Cookie domain for production (e.g., ".yourdomain.com")
        /// Leave null for localhost
        /// </summary>
        public string? Domain { get; set; } = null;
    }
}
