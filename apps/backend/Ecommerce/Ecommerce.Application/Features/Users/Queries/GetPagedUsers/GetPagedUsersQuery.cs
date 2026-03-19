using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetPagedUsers
{
    /// <summary>
    /// Query để lấy danh sách người dùng với phân trang và bộ lọc
    /// </summary>
    public class GetPagedUsersQuery : IRequest<Result<PaginatedList<UserDto>>>
    {
        /// <summary>
        /// Số trang hiện tại
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// Số lượng kết quả trên mỗi trang
        /// </summary>
        public int PageSize { get; set; } = 10;

        /// <summary>
        /// Tìm kiếm theo từ khóa
        /// </summary>
        public string SearchTerm { get; set; } = string.Empty;

        /// <summary>
        /// Lọc theo vai trò
        /// </summary>
        public string RoleFilter { get; set; } = string.Empty;

        /// <summary>
        /// Lọc theo trạng thái
        /// </summary>
        public EUserStatus? StatusFilter { get; set; }

        /// <summary>
        /// Lọc theo cấp độ khách hàng
        /// </summary>
        public ECustomerLevel? CustomerLevelFilter { get; set; }

        /// <summary>
        /// Sắp xếp theo trường nào
        /// </summary>
        public string SortBy { get; set; } = "CreatedAt";

        /// <summary>
        /// Sắp xếp tăng dần hay giảm dần
        /// </summary>
        public bool IsDescending { get; set; } = true;
    }
}

