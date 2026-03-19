namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Interface cung cấp thông tin và thao tác liên quan đến người dùng hiện tại đang đăng nhập.
    /// </summary>
    public interface ICurrentUserService
    {
        /// <summary>
        /// Id của người dùng hiện tại (nếu đã đăng nhập).
        /// </summary>
        Guid? UserId { get; }

        /// <summary>
        /// Địa chỉ email của người dùng hiện tại.
        /// </summary>
        string Email { get; }

        /// <summary>
        /// Trạng thái xác thực: true nếu người dùng đã đăng nhập.
        /// </summary>
        bool IsAuthenticated { get; }

        /// <summary>
        /// Danh sách vai trò (roles) của người dùng hiện tại.
        /// </summary>
        List<string> UserRoles { get; }

        /// <summary>
        /// Lấy giá trị của một claim bất kỳ từ JWT hoặc HttpContext.
        /// </summary>
        /// <param name="claimType">Tên claim cần lấy.</param>
        /// <returns>Giá trị của claim nếu có, ngược lại trả về null.</returns>
        string GetClaim(string claimType);

        /// <summary>
        /// Kiểm tra người dùng hiện tại có thuộc vai trò nào đó không.
        /// </summary>
        /// <param name="role">Tên role cần kiểm tra.</param>
        /// <returns>True nếu người dùng có role, ngược lại là false.</returns>
        bool IsInRole(string role);

        /// <summary>
        /// Lấy tên người dùng hiện tại (nếu có).
        /// </summary>
        string FullName { get; }

        /// <summary>
        /// Kiểm tra người dùng hiện tại có claim cụ thể hay không.
        /// </summary>
        /// <param name="claimType">Loại claim.</param>
        /// <param name="claimValue">Giá trị claim (tùy chọn).</param>
        /// <returns>True nếu có claim, ngược lại là false.</returns>
        bool HasClaim(string claimType, string? claimValue = null);

        Task<bool> IsInRoleAsync(string role);

        /// <summary>
        /// Id của khách vãng lai (guest) từ header X-Guest-ID.
        /// </summary>
        string? GuestId { get; }
    }

}

