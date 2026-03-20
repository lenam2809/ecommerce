namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Interface định nghĩa các phương thức thao tác với bộ nhớ đệm (cache).
    /// Hỗ trợ lưu, đọc và xoá dữ liệu cache với các tuỳ chọn thời gian hết hạn.
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Lấy dữ liệu từ cache theo key.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu muốn lấy (phải là class).</typeparam>
        /// <param name="key">Khóa xác định dữ liệu trong cache.</param>
        /// <returns>Dữ liệu tương ứng với key, hoặc null nếu không tìm thấy.</returns>
        Task<T?> GetAsync<T>(string key) where T : class;

        /// <summary>
        /// Ghi dữ liệu vào cache với các tùy chọn thời gian hết hạn tuyệt đối và trượt.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu muốn lưu (phải là class).</typeparam>
        /// <param name="key">Khóa xác định dữ liệu trong cache.</param>
        /// <param name="value">Giá trị cần lưu vào cache.</param>
        /// <param name="absoluteExpireTime">Thời gian hết hạn tuyệt đối (dữ liệu sẽ bị xoá sau khoảng thời gian này).</param>
        /// <param name="slidingExpireTime">Thời gian hết hạn trượt (reset lại nếu có truy cập trong khoảng này).</param>
        Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null) where T : class;
        Task RemoveAsync(string key);
        Task RemoveByPrefixAsync(string prefixKey);
    }

}

