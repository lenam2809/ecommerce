using Ecommerce.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Extensions
{
    public static class ResultExtensions
    {
        public static IActionResult ToActionResult<T>(this Result<T> result)
        {
            return result.ErrorType switch
            {
                ResultError.None => OkResult(result.Value),
                ResultError.NotFound => NotFoundResult(result.Error),
                ResultError.Unauthorized => UnauthorizedResult(result.Error),
                ResultError.BadRequest => BadRequestResult(result.Error),
                ResultError.ServerError => ServerErrorResult(result.Error),
                ResultError.Invalid => BadRequestResult(result.Error), // Invalid thường trả về BadRequest (400)
                ResultError.Conflict => ConflictResult(result.Error),
                ResultError.Forbidden => ForbiddenResult(result.Error),
                ResultError.ValidationError => UnprocessableEntityResult(result.Error), // 422 Unprocessable Entity
                _ => UnknownErrorResult()
            };
        }

        private static OkObjectResult OkResult<T>(T value) =>
            new OkObjectResult(new { Success = true, Data = value });

        private static NotFoundObjectResult NotFoundResult(string? error) =>
            new NotFoundObjectResult(new { Success = false, Error = error ?? "Not found" });

        private static UnauthorizedObjectResult UnauthorizedResult(string? error) =>
            new UnauthorizedObjectResult(new { Success = false, Error = error ?? "Unauthorized" });

        private static BadRequestObjectResult BadRequestResult(string? error) =>
            new BadRequestObjectResult(new { Success = false, Error = error ?? "Bad request" });

        private static ObjectResult ServerErrorResult(string? error) =>
            new ObjectResult(new { Success = false, Error = error ?? "Server error" })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };

        private static ConflictObjectResult ConflictResult(string? error) =>
            new ConflictObjectResult(new { Success = false, Error = error ?? "Conflict" });

        private static ForbidResult ForbiddenResult(string? error) =>
            new ForbidResult(); // Hoặc có thể trả về ObjectResult với message

        private static ObjectResult UnprocessableEntityResult(string? error) =>
            new ObjectResult(new { Success = false, Error = error ?? "Validation failed" })
            {
                StatusCode = StatusCodes.Status422UnprocessableEntity
            };

        private static ObjectResult UnknownErrorResult() =>
            new ObjectResult(new { Success = false, Error = "Unknown error" })
            {
                StatusCode = StatusCodes.Status500InternalServerError
            };
    }
}

