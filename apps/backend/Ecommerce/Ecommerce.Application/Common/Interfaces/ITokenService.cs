using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Common.Interfaces
{
    /// <summary>
    /// Interface định nghĩa các phương thức liên quan đến xử lý JWT token,
    /// bao gồm tạo access token, refresh token, kiểm tra hợp lệ và trích xuất thông tin từ token.
    /// </summary>
    public interface ITokenService
    {
        /// <summary>
        /// Tạo access token (JWT) cho người dùng dựa trên thông tin người dùng, vai trò và quyền hạn.
        /// </summary>
        /// <param name="user">Người dùng đăng nhập.</param>
        /// <param name="roles">Danh sách các vai trò của người dùng.</param>
        /// <param name="permissions">Danh sách các quyền hạn của người dùng.</param>
        /// <returns>Chuỗi JWT access token đã mã hóa.</returns>
        string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles, IEnumerable<string> permissions);

        /// <summary>
        /// Tạo refresh token (dùng để lấy lại access token mới khi hết hạn).
        /// </summary>
        /// <returns>Chuỗi refresh token ngẫu nhiên và an toàn.</returns>
        string GenerateRefreshToken();

        /// <summary>
        /// Kiểm tra xem token có hợp lệ hay không (chữ ký, thời gian hết hạn, v.v.).
        /// </summary>
        /// <param name="token">Chuỗi JWT cần kiểm tra.</param>
        /// <returns>True nếu token hợp lệ, ngược lại là false.</returns>
        bool ValidateToken(string token);

        /// <summary>
        /// Trích xuất UserId từ token.
        /// </summary>
        /// <param name="token">Chuỗi JWT chứa thông tin người dùng.</param>
        /// <returns>UserId dưới dạng chuỗi, hoặc null nếu không tìm thấy.</returns>
        string GetUserIdFromToken(string token);
    }

}

