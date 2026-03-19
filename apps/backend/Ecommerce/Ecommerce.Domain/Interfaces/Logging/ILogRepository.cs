using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Interfaces.Logging
{
    /// <summary>
    /// Interface dùng để định nghĩa các phương thức thao tác với dữ liệu log trong hệ thống.
    /// </summary>
    public interface ILogRepository
    {
        /// <summary>
        /// Lưu một bản ghi log vào hệ thống lưu trữ (cơ sở dữ liệu, file, v.v.).
        /// </summary>
        /// <param name="logEntry">Đối tượng log chứa thông tin cần lưu.</param>
        Task SaveLogAsync(LogEntry logEntry);

        /// <summary>
        /// Lấy danh sách các bản ghi log theo điều kiện lọc (ngày bắt đầu, ngày kết thúc, cấp độ log).
        /// </summary>
        /// <param name="startDate">Ngày bắt đầu để lọc log (có thể để null nếu không cần lọc theo ngày).</param>
        /// <param name="endDate">Ngày kết thúc để lọc log (có thể để null nếu không cần lọc theo ngày).</param>
        /// <param name="level">Cấp độ log cần lọc (Info, Warning, Error, v.v.).</param>
        /// <returns>Danh sách các bản ghi log thỏa mãn điều kiện.</returns>
        Task<IEnumerable<LogEntry>> GetLogsAsync(
            DateTime? startDate = null,
            DateTime? endDate = null,
            ELogLevel? level = null);
    }

}

