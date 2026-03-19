using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Queries.GetRoleById
{
    public class GetRoleByIdQuery : IRequest<Result<RoleDto>>
    {
        /// <summary>
        /// ID của quyền cần lấy thông tin
        /// </summary>
        public Guid Id { get; set; }
    }
}

