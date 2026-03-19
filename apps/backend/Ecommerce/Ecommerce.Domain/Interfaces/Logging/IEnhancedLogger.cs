using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Interfaces.Logging
{
    /// <summary>
    /// Giao diện IEnhancedLogger mở rộng các chức năng ghi log cơ bản bằng cách kết hợp
    /// các giao diện ILogRepository, IAuditLogger và IPerformanceLogger.
    /// Cung cấp các phương thức ghi log đồng bộ và bất đồng bộ với nhiều thông tin chi tiết.
    /// </summary>
    public interface IEnhancedLogger :
        ILogRepository,  // Cung cấp khả năng lưu trữ và truy xuất log
        IAuditLogger,    // Cung cấp khả năng ghi log cho mục đích kiểm toán
        IPerformanceLogger  // Cung cấp khả năng ghi log hiệu suất
    {
        /// <summary>
        /// Ghi log với mức độ, thông điệp, tên sự kiện và các thuộc tính tùy chọn.
        /// </summary>
        /// <param name="level">Mức độ ưu tiên của log</param>
        /// <param name="message">Nội dung thông điệp cần ghi</param>
        /// <param name="eventName">Tên định danh của sự kiện</param>
        /// <param name="properties">Các thuộc tính bổ sung cho log (tùy chọn)</param>
        void Log(ELogLevel level, string message,
            string eventName,
            Dictionary<string, object>? properties = null);

        /// <summary>
        /// Ghi log bất đồng bộ với mức độ, thông điệp, tên sự kiện và các thuộc tính tùy chọn.
        /// </summary>
        /// <param name="level">Mức độ ưu tiên của log</param>
        /// <param name="message">Nội dung thông điệp cần ghi</param>
        /// <param name="eventName">Tên định danh của sự kiện</param>
        /// <param name="properties">Các thuộc tính bổ sung cho log (tùy chọn)</param>
        /// <returns>Task đại diện cho thao tác bất đồng bộ</returns>
        Task LogAsync(ELogLevel level, string message,
                    string eventName,
                    ELogType logType = ELogType.Default,
                    Dictionary<string, object>? properties = null);

        /// <summary>
        /// Ghi log bất đồng bộ cho ngoại lệ với tên sự kiện.
        /// </summary>
        /// <param name="ex">Đối tượng ngoại lệ cần ghi log</param>
        /// <param name="eventName">Tên định danh của sự kiện xảy ra ngoại lệ</param>
        /// <returns>Task đại diện cho thao tác bất đồng bộ</returns>
        Task LogExceptionAsync(Exception ex, string eventName);
    }
}

