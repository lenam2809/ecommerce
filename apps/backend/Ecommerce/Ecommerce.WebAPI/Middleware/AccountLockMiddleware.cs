using Ecommerce.Application.Common.Interfaces;
using System.Security.Claims;

namespace Ecommerce.WebAPI.Middleware
{
    public class AccountLockMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;

        public AccountLockMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
        {
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Chỉ kiểm tra cho các request đã authenticate
            if (context.User.Identity.IsAuthenticated)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var accountLockService = scope.ServiceProvider.GetRequiredService<IAccountLockService>();

                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (Guid.TryParse(userIdClaim, out var userId))
                    {
                        var isLocked = await accountLockService.IsUserLockedAsync(userId);
                        if (isLocked)
                        {
                            var activeLock = await accountLockService.GetActiveLockAsync(userId);

                            context.Response.StatusCode = 423; // Locked
                            await context.Response.WriteAsync($"Tài khoản đã bị khóa. Lý do: {activeLock?.Reason}");
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }

    // Extension method để đăng ký middleware
    public static class AccountLockMiddlewareExtensions
    {
        public static IApplicationBuilder UseAccountLockCheck(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<AccountLockMiddleware>();
        }
    }
}

