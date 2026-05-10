namespace Ecommerce.Application.Common.Models
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public T Value { get; }
        public string? Error { get; }
        public ResultError ErrorType { get; }

        private Result(bool isSuccess, T value, string? error, ResultError errorType)
        {
            IsSuccess = isSuccess;
            Value = value;
            Error = error;
            ErrorType = errorType;
        }

        public static Result<T> Success(T value) =>
            new Result<T>(true, value, null, ResultError.None);

        public static Result<T> Failure(ResultError errorType, string error) =>
            new Result<T>(false, default!, error, errorType);

        // Các phương thức tiện ích mở rộng
        public static Result<T> NotFound(string error = "Không tìm thấy tài nguyên") =>
            Failure(ResultError.NotFound, error);

        public static Result<T> Unauthorized(string error = "Truy cập không được phép") =>
            Failure(ResultError.Unauthorized, error);

        public static Result<T> BadRequest(string error = "Yêu cầu không hợp lệ") =>
            Failure(ResultError.BadRequest, error);

        public static Result<T> ServerError(string error = "Lỗi máy chủ nội bộ") =>
            Failure(ResultError.ServerError, error);

        public static Result<T> Invalid(string error = "Dữ liệu không hợp lệ") =>
            Failure(ResultError.Invalid, error);

        public static Result<T> Conflict(string error = "Đã xảy ra xung đột dữ liệu") =>
            Failure(ResultError.Conflict, error);

        public static Result<T> Forbidden(string error = "Truy cập bị từ chối") =>
            Failure(ResultError.Forbidden, error);

        public static Result<T> ValidationError(string error = "Xác thực dữ liệu thất bại") =>
            Failure(ResultError.ValidationError, error);

        public static Result<T> ServiceUnavailable(string error = "Dịch vụ tạm thời không khả dụng") =>
            Failure(ResultError.ServiceUnavailable, error);

        // Phương thức hỗ trợ kiểm tra và chuyển đổi
        public bool IsFailure => !IsSuccess;
        public bool IsNotFound => ErrorType == ResultError.NotFound;
        public bool IsUnauthorized => ErrorType == ResultError.Unauthorized;
    }

    public enum ResultError
    {
        None,
        NotFound,
        Unauthorized,
        BadRequest,
        ServerError,
        Invalid,
        Conflict,
        Forbidden,
        ValidationError,
        ServiceUnavailable
    }
}

