using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Roles.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Roles.Queries.GetAllRoles
{
    public class GetAllRolesQuery : IRequest<Result<List<RoleDto>>>
    {
    }
}

