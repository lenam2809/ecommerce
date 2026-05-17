using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Features.Auth.Commands.LoginUser;
using Ecommerce.Application.Features.Auth.Commands.ExternalLogin;
using Ecommerce.Application.Features.Auth.Commands.RefreshToken;
using Ecommerce.Application.Features.Auth.Commands.RegisterUser;
using Ecommerce.Application.Features.Auth.Commands.RevokeToken;
using Ecommerce.Application.Features.Auth.Commands.ForgotPassword;
using Ecommerce.Application.Features.Auth.Commands.ResetPassword;
using Ecommerce.Application.Features.Auth.Queries.GetProfile;
using Ecommerce.Application.Policies;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using System.Security.Claims;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private const string ResetPasswordContextCookieName = "pwd_reset_ctx";
        private readonly IMediator _mediator;
        private readonly IConfiguration _configuration;
        private readonly AuthConfig _authConfig;
        private readonly IUnitOfWork _unitOfWork;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(
            IMediator mediator, 
            IConfiguration configuration,
            IOptions<AuthConfig> authConfig,
            IUnitOfWork unitOfWork,
            SignInManager<ApplicationUser> signInManager)
        {
            _mediator = mediator;
            _configuration = configuration;
            _authConfig = authConfig.Value;
            _unitOfWork = unitOfWork;
            _signInManager = signInManager;
        }

        /// <summary>
        /// Register a new user - returns only user ID (tokens set via cookies after login)
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterCommand command)
        {
            var result = await _mediator.Send(command);
            // RegisterCommand returns Result<Guid> - no tokens, user needs to login after registration
            return result.ToActionResult();
        }

        /// <summary>
        /// Login user - sets httpOnly cookies and returns user info
        /// </summary>
        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login(LoginUserCommand command)
        {
            command.UserAgent = Request.Headers.UserAgent.ToString();
            command.IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _mediator.Send(command);
            
            if (result.IsSuccess && result.Value != null)
            {
                // Set httpOnly cookies
                Response.SetAuthCookies(
                    result.Value.AccessToken, 
                    result.Value.RefreshToken, 
                    _configuration
                );
                Response.SetCsrfCookie(_configuration);

                // Build response based on config
                if (_authConfig.IncludeTokensInResponse)
                {
                    // Backward compatible: include tokens in body
                    return Ok(new
                    {
                        success = true,
                        data = result.Value
                    });
                }
                else
                {
                    // New way: no tokens in response body
                    return Ok(new
                    {
                        success = true,
                        data = new
                        {
                            result.Value.UserId,
                            result.Value.Email,
                            result.Value.FirstName,
                            result.Value.LastName,
                            result.Value.FullName,
                            result.Value.PhoneNumber,
                            result.Value.Roles,
                            result.Value.Permissions,
                            result.Value.CustomerLevel
                        }
                    });
                }
            }

            return result.ToActionResult();
        }

        /// <summary>
        /// Refresh access token using refresh token from cookie or body
        /// </summary>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand? command = null)
        {
            // Try to get tokens from cookies first (new way)
            var accessToken = Request.GetAccessTokenFromCookie();
            var refreshToken = Request.GetRefreshTokenFromCookie();

            // Fall back to request body (backward compatibility)
            if (string.IsNullOrEmpty(refreshToken) && command != null)
            {
                accessToken = command.AccessToken;
                refreshToken = command.RefreshToken;
            }

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { success = false, message = "Refresh token không tồn tại" });
            }

            var refreshCommand = new RefreshTokenCommand
            {
                AccessToken = accessToken ?? "",
                RefreshToken = refreshToken,
                UserAgent = Request.Headers.UserAgent.ToString(),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString()
            };

            var result = await _mediator.Send(refreshCommand);
            
            if (result.IsSuccess && result.Value != null)
            {
                // Set new cookies
                Response.SetAuthCookies(
                    result.Value.AccessToken, 
                    result.Value.RefreshToken, 
                    _configuration
                );
                Response.SetCsrfCookie(_configuration);

                if (_authConfig.IncludeTokensInResponse)
                {
                    return Ok(new
                    {
                        success = true,
                        data = result.Value
                    });
                }
                else
                {
                    return Ok(new { success = true, message = "Token đã được làm mới" });
                }
            }

            // Clear invalid cookies on refresh failure
            Response.ClearAuthCookies(_configuration);
            return result.ToActionResult();
        }

        /// <summary>
        /// Logout user - revokes refresh token and clears cookies
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            // Try to get refresh token from cookie first
            var refreshToken = Request.GetRefreshTokenFromCookie();
            
            if (!string.IsNullOrEmpty(refreshToken))
            {
                try
                {
                    await _mediator.Send(new RevokeTokenCommand { RefreshToken = refreshToken });
                }
                catch
                {
                    // Ignore errors during revocation - still clear cookies
                }
            }

            // Clear all auth cookies
            Response.ClearAuthCookies(_configuration);

            return Ok(new { success = true, message = "Đăng xuất thành công" });
        }

        /// <summary>
        /// Revoke a specific refresh token
        /// </summary>
        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(RevokeTokenCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var result = await _mediator.Send(new GetProfileQuery());
            return result.ToActionResult();
        }

        /// <summary>
        /// Starts a customer Google OAuth sign-in flow.
        /// </summary>
        [HttpPost("external-login")]
        [AllowAnonymous]
        public IActionResult ExternalLogin([FromQuery] string provider, [FromQuery] string? returnUrl, [FromForm] string? guestId)
        {
            if (!string.Equals(provider, "Google", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { success = false, message = "Unsupported external login provider." });
            }

            if (string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientId"]) ||
                string.IsNullOrWhiteSpace(_configuration["Authentication:Google:ClientSecret"]))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, new { success = false, message = "Google sign-in is not configured." });
            }

            var safeReturnUrl = NormalizeReturnUrl(returnUrl);
            var redirectUrl = Url.Action(nameof(GoogleResponse), "Auth");
            var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
            properties.Items["returnUrl"] = safeReturnUrl;
            if (!string.IsNullOrWhiteSpace(guestId) && guestId.Length <= 64)
            {
                properties.Items["guestId"] = guestId;
            }

            return Challenge(properties, provider);
        }

        /// <summary>
        /// Handles Google OAuth callback, creates or links the customer account, and sets auth cookies.
        /// </summary>
        [HttpGet("google-response")]
        [AllowAnonymous]
        public async Task<IActionResult> GoogleResponse()
        {
            var authenticateResult = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
            var returnUrl = NormalizeReturnUrl(GetAuthenticationProperty(authenticateResult, "returnUrl"));
            var clientCallbackUrl = BuildClientGoogleCallbackUrl(returnUrl);

            if (!authenticateResult.Succeeded || authenticateResult.Principal == null)
            {
                return Redirect(AppendQuery(clientCallbackUrl, "error", "google_auth_failed"));
            }

            var principal = authenticateResult.Principal;
            var providerKey = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = principal.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrWhiteSpace(providerKey) || string.IsNullOrWhiteSpace(email))
            {
                await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
                return Redirect(AppendQuery(clientCallbackUrl, "error", "google_profile_incomplete"));
            }

            var command = new ExternalLoginCommand(
                "Google",
                providerKey,
                email,
                principal.FindFirstValue(ClaimTypes.GivenName),
                principal.FindFirstValue(ClaimTypes.Surname),
                principal.FindFirstValue("picture"),
                GetAuthenticationProperty(authenticateResult, "guestId"),
                Request.Headers.UserAgent.ToString(),
                HttpContext.Connection.RemoteIpAddress?.ToString());

            var result = await _mediator.Send(command);
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            if (result.IsSuccess && result.Value != null)
            {
                Response.SetAuthCookies(result.Value.AccessToken, result.Value.RefreshToken, _configuration);
                Response.SetCsrfCookie(_configuration);
                return Redirect(clientCallbackUrl);
            }

            return Redirect(AppendQuery(clientCallbackUrl, "error", "google_login_failed"));
        }

        /// <summary>
        /// Get current authenticated profile for middleware authorization checks.
        /// </summary>
        [HttpGet("me/profile")]
        [Authorize]
        public IActionResult GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
            var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToArray();
            var permissions = User.FindAll(AuthorizationClaimTypes.Permission).Select(c => c.Value).Distinct().ToArray();

            return Ok(new
            {
                userId,
                email,
                roles,
                permissions
            });
        }

        /// <summary>
        /// Health check endpoint to verify cookie support
        /// </summary>
        [HttpGet("cookie-check")]
        public IActionResult CookieCheck()
        {
            var hasCookie = Request.Cookies.ContainsKey("access_token") || 
                           Request.Cookies.ContainsKey("csrf_token");
            
            return Ok(new 
            { 
                cookiesEnabled = true,
                hasCookie = hasCookie
            });
        }

        /// <summary>
        /// Request a password reset link
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [EnableRateLimiting("PasswordResetPolicy")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Reset user password with token
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        [EnableRateLimiting("PasswordResetPolicy")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
        {
            var result = await _mediator.Send(command);
            return result.ToActionResult();
        }

        /// <summary>
        /// Verifies reset password request id and issues short-lived reset context cookie.
        /// </summary>
        [HttpPost("reset-password/verify")]
        [AllowAnonymous]
        [EnableRateLimiting("PasswordResetPolicy")]
        public async Task<IActionResult> VerifyResetPassword([FromBody] VerifyResetPasswordRequest request, CancellationToken cancellationToken)
        {
            if (!Guid.TryParse(request.RequestId, out var requestId))
            {
                return BadRequest(new { success = false, error = "Invalid or expired link" });
            }

            var tokenRecord = await _unitOfWork.BaseRepository<PasswordResetToken>()
                .GetQueryable()
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == requestId, cancellationToken);

            if (tokenRecord == null || !tokenRecord.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid or expired link" });
            }

            Response.Cookies.Append(ResetPasswordContextCookieName, tokenRecord.Id.ToString("D"), new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Path = "/api/auth/reset-password",
                Expires = DateTimeOffset.UtcNow.AddMinutes(5)
            });

            return Ok(new { success = true });
        }

        /// <summary>
        /// Confirms password reset using reset context cookie only.
        /// </summary>
        [HttpPost("reset-password/confirm")]
        [AllowAnonymous]
        [EnableRateLimiting("PasswordResetPolicy")]
        public async Task<IActionResult> ConfirmResetPassword([FromBody] ConfirmResetPasswordRequest request)
        {
            var requestId = Request.Cookies[ResetPasswordContextCookieName];
            if (string.IsNullOrWhiteSpace(requestId))
            {
                return BadRequest(new { success = false, error = "Invalid or expired link" });
            }

            var result = await _mediator.Send(new ResetPasswordCommand(
                Token: string.Empty,
                NewPassword: request.NewPassword,
                ConfirmPassword: request.NewPassword,
                RequestId: requestId
            ));

            if (result.IsSuccess)
            {
                Response.Cookies.Delete(ResetPasswordContextCookieName, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
                    Path = "/api/auth/reset-password"
                });
            }

            return result.ToActionResult();
        }

        public sealed record VerifyResetPasswordRequest(string RequestId);
        public sealed record ConfirmResetPasswordRequest(string NewPassword);

        private static string NormalizeReturnUrl(string? returnUrl)
        {
            if (string.IsNullOrWhiteSpace(returnUrl))
            {
                return "/";
            }

            if (!returnUrl.StartsWith("/", StringComparison.Ordinal) ||
                returnUrl.StartsWith("//", StringComparison.Ordinal) ||
                returnUrl.Contains('\\'))
            {
                return "/";
            }

            return returnUrl;
        }

        private string BuildClientGoogleCallbackUrl(string returnUrl)
        {
            var clientUrl = _configuration["AppUrl:Frontend"]
                ?? _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()?.FirstOrDefault()
                ?? "http://localhost:3000";

            var callback = new Uri(new Uri(clientUrl.TrimEnd('/') + "/"), "auth/google-callback");
            return AppendQuery(callback.ToString(), "returnUrl", returnUrl);
        }

        private static string AppendQuery(string url, string key, string value)
        {
            var separator = url.Contains('?') ? "&" : "?";
            return $"{url}{separator}{Uri.EscapeDataString(key)}={Uri.EscapeDataString(value)}";
        }

        private static string? GetAuthenticationProperty(AuthenticateResult result, string key)
        {
            return result.Properties?.Items.TryGetValue(key, out var value) == true ? value : null;
        }
    }
}
