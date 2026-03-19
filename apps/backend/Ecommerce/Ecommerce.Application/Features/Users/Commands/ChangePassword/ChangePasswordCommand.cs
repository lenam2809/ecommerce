using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.ChangePassword
{
    /// <summary>
    /// Command để thay đổi mật khẩu của người dùng
    /// </summary>
    public class ChangePasswordCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của người dùng cần thay đổi mật khẩu
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Mật khẩu hiện tại (cần xác thực)
        /// </summary>
        public string CurrentPassword { get; set; }

        /// <summary>
        /// Mật khẩu mới
        /// </summary>
        public string NewPassword { get; set; }

        /// <summary>
        /// Xác nhận mật khẩu mới
        /// </summary>
        public string ConfirmNewPassword { get; set; }
    }
}

