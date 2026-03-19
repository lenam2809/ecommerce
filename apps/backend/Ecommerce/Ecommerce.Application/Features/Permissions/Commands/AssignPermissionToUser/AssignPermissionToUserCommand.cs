using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToUser
{
    /// <summary>
    /// Command gán quyền cho người dùng
    /// </summary>
    public class AssignPermissionToUserCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của người dùng
        /// </summary>
        public Guid UserId { get; set; }

        /// <summary>
        /// Danh sách ID của các quyền cần gán
        /// </summary>
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}

