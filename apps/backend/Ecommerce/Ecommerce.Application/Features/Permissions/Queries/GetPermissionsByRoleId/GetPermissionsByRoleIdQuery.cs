using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetPermissionsByRoleId
{
    /// <summary>
    /// Query lấy danh sách quyền của một vai trò
    /// </summary>
    public class GetPermissionsByRoleIdQuery : IRequest<Result<List<PermissionDto>>>
    {
        /// <summary>
        /// ID của vai trò cần lấy danh sách quyền
        /// </summary>
        public Guid RoleId { get; set; }
    }
}

