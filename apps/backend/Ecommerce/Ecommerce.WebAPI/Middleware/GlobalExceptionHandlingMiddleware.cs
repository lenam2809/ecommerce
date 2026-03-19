using Ecommerce.Domain.Interfaces.Logging;

namespace Ecommerce.WebAPI.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _scopeFactory;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _scopeFactory = scopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (FluentValidation.ValidationException ex)
            {
                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";

                var errors = ex.Errors.Select(e => e.ErrorMessage).ToList();
                var response = new
                {
                    error = "Lỗi dữ liệu không hợp lệ",
                    details = errors
                };

                await context.Response.WriteAsJsonAsync(response);
            }
            catch (ArgumentException ex)
            {
                context.Response.StatusCode = 400;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    error = ex.Message
                };

                await context.Response.WriteAsJsonAsync(response);
            }
            catch (Exception ex)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var logger = scope.ServiceProvider.GetRequiredService<IEnhancedLogger>();
                    await logger.LogExceptionAsync(ex, "Ngoại lệ chưa được xử lý");
                }
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    error = "Đã xảy ra lỗi trong quá trình xử lý yêu cầu"
                };

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }

    // Extension method
    public static class GlobalExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<GlobalExceptionHandlingMiddleware>();
        }
    }
}

