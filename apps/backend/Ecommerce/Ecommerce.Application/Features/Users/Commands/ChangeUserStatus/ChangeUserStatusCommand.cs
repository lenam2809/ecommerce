using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.ChangeUserStatus
{
    /// <summary>
    /// Command để thay đổi trạng thái của người dùng
    /// </summary>
    public class ChangeUserStatusCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của người dùng cần thay đổi trạng thái
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Trạng thái mới của người dùng
        /// </summary>
        public EUserStatus NewStatus { get; set; }

        /// <summary>
        /// Ghi chú về lý do thay đổi trạng thái (nếu có)
        /// </summary>
        public string StatusChangeReason { get; set; }
    }
}

