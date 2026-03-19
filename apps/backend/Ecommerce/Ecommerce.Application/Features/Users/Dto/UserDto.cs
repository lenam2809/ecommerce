using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using AutoMapper;

namespace Ecommerce.Application.Features.Users.Dto
{
    /// <summary>
    /// DTO chứa thông tin người dùng để trả về cho client
    /// </summary>
    public class UserDto : IMapFrom<ApplicationUser>
    {
        /// <summary>
        /// ID của người dùng
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Email/tên đăng nhập của người dùng
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Tên của người dùng
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Họ của người dùng
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Tên đầy đủ của người dùng
        /// </summary>
        public string FullName => $"{FirstName} {LastName}";

        /// <summary>
        /// Đường dẫn ảnh đại diện
        /// </summary>
        public string Avatar { get; set; } = string.Empty;

        /// <summary>
        /// Số điện thoại của người dùng
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Cấp độ khách hàng
        /// </summary>
        public ECustomerLevel CustomerLevel { get; set; }

        /// <summary>
        /// Điểm thưởng của khách hàng
        /// </summary>
        public int PromotionPoints { get; set; }

        /// <summary>
        /// Trạng thái của người dùng
        /// </summary>
        public EUserStatus Status { get; set; }

        /// <summary>
        /// Thời gian tạo tài khoản
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời gian cập nhật thông tin gần nhất
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Thời gian đăng nhập gần nhất
        /// </summary>
        public DateTime? LastLogin { get; set; }

        /// <summary>
        /// Danh sách vai trò của người dùng
        /// </summary>
        public IEnumerable<string> Roles { get; set; } = [];

        /// <summary>
        /// Danh sách quyền của người dùng
        /// </summary>
        public IEnumerable<string> Permissions { get; set; } = new List<string>();

        /// <summary>
        /// Số lượng đơn hàng đã đặt
        /// </summary>
        public int OrderCount { get; set; }

        /// <summary>
        /// Tổng số tiền đã chi tiêu
        /// </summary>
        public decimal TotalSpent { get; set; }

        /// <summary>
        /// Thời gian đặt hàng gần nhất
        /// </summary>
        public DateTime LastOrder { get; set; }

        /// <summary>
        /// Cấu hình mapping từ entity sang DTO
        /// </summary>
        public void Mapping(Profile profile)
        {
            profile.CreateMap<ApplicationUser, UserDto>()
                .ForMember(d => d.Roles, opt => opt.Ignore())
                .ForMember(d => d.Permissions, opt => opt.Ignore());
        }
    }
}

