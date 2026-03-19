namespace Ecommerce.Domain.Interfaces.Logging
{
    /// <summary>
    /// Interface dùng để định nghĩa các phương thức ghi log theo nhiều cấp độ khác nhau.
    /// Có thể triển khai bằng thư viện Serilog hoặc các hệ thống log khác.
    /// </summary>
    public interface ISeriLogger
    {
        /// <summary>
        /// Ghi log thông tin chung, thường dùng để theo dõi luồng xử lý của hệ thống.
        /// </summary>
        /// <param name="message">Thông điệp cần ghi log.</param>
        void LogInformation(string message);

        /// <summary>
        /// Ghi log cảnh báo, thường dùng để thông báo những vấn đề có thể gây lỗi trong tương lai.
        /// </summary>
        /// <param name="message">Thông điệp cảnh báo cần ghi log.</param>
        void LogWarning(string message);

        /// <summary>
        /// Ghi log ở mức độ debug, thường dùng trong quá trình phát triển để kiểm tra giá trị hoặc hành vi của hệ thống.
        /// </summary>
        /// <param name="message">Thông điệp debug cần ghi log.</param>
        void LogDebug(string message);

        /// <summary>
        /// Ghi log lỗi, dùng khi xảy ra lỗi cần được theo dõi và xử lý.
        /// </summary>
        /// <param name="message">Thông điệp lỗi cần ghi log.</param>
        void LogError(string message);

        /// <summary>
        /// Ghi log lỗi kèm theo Exception để lưu lại thông tin chi tiết về ngoại lệ đã xảy ra.
        /// </summary>
        /// <param name="exception">Đối tượng Exception chứa thông tin lỗi.</param>
        /// <param name="message">Thông điệp lỗi mô tả thêm về bối cảnh xảy ra lỗi.</param>
        void LogError(Exception exception, string message);
    }

}

