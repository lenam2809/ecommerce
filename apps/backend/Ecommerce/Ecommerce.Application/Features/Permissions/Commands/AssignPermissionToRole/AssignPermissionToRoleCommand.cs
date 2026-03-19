using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.AssignPermissionToRole
{
    /// <summary>
    /// Command gán quyền cho vai trò
    /// </summary>
    public class AssignPermissionToRoleCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của vai trò
        /// </summary>
        public Guid RoleId { get; set; }

        /// <summary>
        /// Danh sách ID của các quyền cần gán
        /// </summary>
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}

