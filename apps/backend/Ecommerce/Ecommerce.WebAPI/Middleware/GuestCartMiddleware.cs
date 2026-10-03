using Ecommerce.Application.Common.Constants;

namespace Ecommerce.WebAPI.Middleware
{
    /// <summary>
    /// 🔒 SECURITY (H6): cấp cookie guest_id (httpOnly, do SERVER sinh) cho khách chưa đăng nhập.
    /// Trước đây giỏ hàng guest định danh bằng header X-Guest-ID do client tự đặt — kẻ tấn công
    /// biết/đoán được guestId của nạn nhân có thể đọc/sửa/xóa giỏ và gây cart-poisoning khi merge.
    /// Giờ định danh do server cấp qua cookie, client không thể tự chọn giá trị.
    /// </summary>
    public class GuestCartMiddleware
    {
        private static readonly TimeSpan GuestIdLifetime = TimeSpan.FromDays(7);
        private readonly RequestDelegate _next;

        public GuestCartMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Chỉ cấp cho khách CHƯA đăng nhập và CHƯA có cookie.
            // (User đã login dùng giỏ theo UserId — không cần guest_id)
            if (context.User.Identity?.IsAuthenticated != true &&
                !context.Request.Cookies.ContainsKey(GuestCartConstants.GuestIdCookieName))
            {
                var guestId = Guid.NewGuid().ToString("N");
                context.Response.Cookies.Append(
                    GuestCartConstants.GuestIdCookieName,
                    guestId,
                    BuildCookieOptions(context));

                // Cho CurrentUserService đọc được ngay trong request hiện tại
                // (cookie mới set chỉ có hiệu lực từ request sau)
                context.Items[GuestCartConstants.GuestIdItemKey] = guestId;
            }

            await _next(context);
        }

        private static CookieOptions BuildCookieOptions(HttpContext context)
        {
            var host = context.Request.Host.Host.ToLower();
            var isLocalhost = host is "localhost" or "127.0.0.1" or "::1";

            return new CookieOptions
            {
                HttpOnly = true,
                // Production (cross-site với frontend): cần Secure + SameSite=None
                // Localhost: Lax + Secure theo giao thức đang dùng
                Secure = !isLocalhost || context.Request.IsHttps,
                SameSite = isLocalhost ? SameSiteMode.Lax : SameSiteMode.None,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.Add(GuestIdLifetime)
            };
        }
    }

    public static class GuestCartMiddlewareExtensions
    {
        public static IApplicationBuilder UseGuestCart(this IApplicationBuilder builder)
            => builder.UseMiddleware<GuestCartMiddleware>();
    }
}
