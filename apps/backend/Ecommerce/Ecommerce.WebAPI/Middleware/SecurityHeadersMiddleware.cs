namespace Ecommerce.WebAPI.Middleware
{
    public class SecurityHeadersMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            var headers = context.Response.Headers;

            // Ngăn chặn clickjacking
            headers["X-Frame-Options"] = "DENY";

            // Ngăn MIME type sniffing
            headers["X-Content-Type-Options"] = "nosniff";

            // Kiểm soát referrer thông tin gửi đi
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Tắt cache cho API responses (tránh lộ dữ liệu nhạy cảm)
            headers["Cache-Control"] = "no-store";
            headers["Pragma"] = "no-cache";

            // Hạn chế quyền trình duyệt
            headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";

            // Content Security Policy — cho phép Next.js client và Swagger UI hoạt động
            headers["Content-Security-Policy"] =
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: blob: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self'; " +
                "frame-ancestors 'none';";

            await next(context);
        }
    }

    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
            => app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
