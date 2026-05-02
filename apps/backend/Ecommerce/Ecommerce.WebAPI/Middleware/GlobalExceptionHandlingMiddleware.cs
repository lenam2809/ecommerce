using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;
using Ecommerce.Domain.Interfaces.Logging;
using AppBusinessException = Ecommerce.Application.Common.Exceptions.ApplicationException;

namespace Ecommerce.WebAPI.Middleware
{
    public class GlobalExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            if (context.Response.HasStarted)
            {
                throw exception;
            }

            var logger = context.RequestServices.GetRequiredService<IEnhancedLogger>();
            var (statusCode, logLevel, responseBody) = MapException(context, exception);

            await logger.LogExceptionAsync(
                exception,
                exception.GetType().Name,
                new Dictionary<string, object?>
                {
                    { "Method", context.Request.Method },
                    { "Path", context.Request.Path.Value ?? "/" },
                    { "StatusCode", statusCode }
                },
                logLevel);

            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(responseBody);
        }

        private static (int StatusCode, ELogLevel LogLevel, object ResponseBody) MapException(HttpContext context, Exception exception)
        {
            var correlationId = context.Items.TryGetValue(GlobalLogEnrichmentMiddleware.CorrelationIdItemKey, out var correlationIdValue)
                ? correlationIdValue?.ToString()
                : context.TraceIdentifier;

            return exception switch
            {
                ValidationException validationException => (
                    StatusCodes.Status422UnprocessableEntity,
                    ELogLevel.Warning,
                    new
                    {
                        error = "Lỗi dữ liệu không hợp lệ",
                        details = validationException.Errors,
                        correlationId
                    }),

                FluentValidation.ValidationException fluentValidationException => (
                    StatusCodes.Status422UnprocessableEntity,
                    ELogLevel.Warning,
                    new
                    {
                        error = "Lỗi dữ liệu không hợp lệ",
                        details = fluentValidationException.Errors
                            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
                            .ToDictionary(group => group.Key, group => group.ToArray()),
                        correlationId
                    }),

                NotFoundException => (
                    StatusCodes.Status404NotFound,
                    ELogLevel.Warning,
                    new
                    {
                        error = exception.Message,
                        correlationId
                    }),

                ForbiddenAccessException => (
                    StatusCodes.Status403Forbidden,
                    ELogLevel.Warning,
                    new
                    {
                        error = exception.Message,
                        correlationId
                    }),

                UnauthorizedAccessException => (
                    StatusCodes.Status401Unauthorized,
                    ELogLevel.Warning,
                    new
                    {
                        error = string.IsNullOrWhiteSpace(exception.Message) ? "Bạn chưa được xác thực." : exception.Message,
                        correlationId
                    }),

                ArgumentException => (
                    StatusCodes.Status400BadRequest,
                    ELogLevel.Warning,
                    new
                    {
                        error = exception.Message,
                        correlationId
                    }),

                DomainException or AppBusinessException => (
                    StatusCodes.Status400BadRequest,
                    ELogLevel.Warning,
                    new
                    {
                        error = exception.Message,
                        correlationId
                    }),

                _ => (
                    StatusCodes.Status500InternalServerError,
                    ELogLevel.Error,
                    new
                    {
                        error = "Đã xảy ra lỗi trong quá trình xử lý yêu cầu.",
                        correlationId
                    })
            };
        }
    }

    public static class GlobalExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<GlobalExceptionHandlingMiddleware>();
        }
    }
}
