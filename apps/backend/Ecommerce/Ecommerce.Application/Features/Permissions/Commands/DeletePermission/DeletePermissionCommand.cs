using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.DeletePermission
{
    /// <summary>
    /// Command xóa quyền
    /// </summary>
    public class DeletePermissionCommand : IRequest<Result<bool>>
    {
        /// <summary>
        /// ID của quyền cần xóa
        /// </summary>
        public Guid Id { get; set; }
    }
}

