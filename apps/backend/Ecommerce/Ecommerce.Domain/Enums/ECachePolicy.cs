namespace Ecommerce.Domain.Enums
{
    /// <summary>
    /// Chính sách thời gian lưu trữ cache.
    /// Giúp xác định thời gian sống (TTL) tương ứng với từng loại dữ liệu.
    /// </summary>
    public enum ECachePolicy
    {
        /// <summary>
        /// Cache ngắn hạn – thường dùng cho dữ liệu hay thay đổi.
        /// Thời gian: 10 phút.
        /// </summary>
        Short,

        /// <summary>
        /// Cache trung bình – dùng cho dữ liệu ít thay đổi.
        /// Thời gian: 1 giờ.
        /// </summary>
        Medium,

        /// <summary>
        /// Cache dài hạn – dùng cho dữ liệu hiếm thay đổi.
        /// Thời gian: 1 ngày.
        /// </summary>
        Long,

        /// <summary>
        /// Cache gần như vĩnh viễn – dùng cho dữ liệu bất biến (immutable).
        /// Thời gian: 365 ngày.
        /// </summary>
        Never
    }
}

