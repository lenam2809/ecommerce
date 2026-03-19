using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Commands.CreatePermission
{
    /// <summary>
    /// Command tạo quyền mới
    /// </summary>
    public class CreatePermissionCommand : IRequest<Result<Guid>>
    {
        /// <summary>
        /// Tên quyền
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Mô tả quyền
        /// </summary>
        public required string Description { get; set; }

        public string? Category { get; set; }

    }
}

