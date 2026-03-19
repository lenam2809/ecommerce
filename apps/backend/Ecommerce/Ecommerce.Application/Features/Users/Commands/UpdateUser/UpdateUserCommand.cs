using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Users.Commands.UpdateUser
{
    /// <summary>
    /// Command để cập nhật thông tin người dùng
    /// </summary>
    public class UpdateUserCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của người dùng cần cập nhật
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Tên của người dùng
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Họ của người dùng
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Số điện thoại của người dùng
        /// </summary>
        public string PhoneNumber { get; set; }

        /// <summary>
        /// Ảnh đại diện mới (nếu có)
        /// </summary>
        public IFormFile Avatar { get; set; }

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
    }
}

