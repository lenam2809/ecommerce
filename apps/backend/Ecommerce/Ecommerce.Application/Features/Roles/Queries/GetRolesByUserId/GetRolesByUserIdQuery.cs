using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Queries.GetRolesByUserId
{
    public class GetRolesByUserIdQuery : IRequest<Result<List<RoleDto>>>
    {
        public Guid UserId { get; set; }
    }

}

