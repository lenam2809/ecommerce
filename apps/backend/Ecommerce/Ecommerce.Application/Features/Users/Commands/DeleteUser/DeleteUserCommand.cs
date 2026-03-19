using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Users.Commands.DeleteUser
{
    /// <summary>
    /// Command để xóa người dùng khỏi hệ thống
    /// </summary>
    public class DeleteUserCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của người dùng cần xóa
        /// </summary>
        public Guid Id { get; set; }
    }
}

