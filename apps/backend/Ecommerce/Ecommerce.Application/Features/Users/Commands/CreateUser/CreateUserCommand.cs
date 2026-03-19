using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Users.Commands.CreateUser
{
    /// <summary>
    /// Command để tạo người dùng mới trong hệ thống
    /// </summary>
    public class CreateUserCommand : IRequest<Result<Guid>>, IMapFrom<ApplicationUser>
    {
        /// <summary>
        /// Email của người dùng, được sử dụng làm tên đăng nhập
        /// </summary>
        public required string Email { get; set; }

        /// <summary>
        /// Mật khẩu của người dùng
        /// </summary>
        public required string Password { get; set; }

        /// <summary>
        /// Tên của người dùng
        /// </summary>
        public required string FirstName { get; set; }

        /// <summary>
        /// Họ của người dùng
        /// </summary>
        public required string LastName { get; set; }

        /// <summary>
        /// Vai trò của người dùng (Admin, Staff, Customer)
        /// </summary>
        public required string Role { get; set; }

        /// <summary>
        /// Ảnh đại diện của người dùng
        /// </summary>
        public IFormFile? Avatar { get; set; }

        /// <summary>
        /// Số điện thoại của người dùng
        /// </summary>
        public required string PhoneNumber { get; set; }

        /// <summary>
        /// Cấp độ khách hàng, mặc định là Bronze
        /// </summary>
        public ECustomerLevel CustomerLevel { get; set; } = ECustomerLevel.Bronze;

        /// <summary>
        /// Điểm thưởng của khách hàng, mặc định là 0
        /// </summary>
        public int PromotionPoints { get; set; } = 0;

        /// <summary>
        /// Trạng thái của người dùng, mặc định là Active
        /// </summary>
        public EUserStatus Status { get; set; } = EUserStatus.Active;

        /// <summary>
        /// Cấu hình mapping từ Command sang entity ApplicationUser
        /// </summary>
        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreateUserCommand, ApplicationUser>()
                .ForMember(dest => dest.Avatar, opt => opt.Ignore()); // Bỏ qua việc map Avatar vì cần xử lý đặc biệt
        }
    }
}
