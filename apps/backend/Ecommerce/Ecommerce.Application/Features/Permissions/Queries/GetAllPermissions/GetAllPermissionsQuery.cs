using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Permissions.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Permissions.Queries.GetAllPermissions
{
    public class GetAllPermissionsQuery : IRequest<Result<List<PermissionDto>>>
    {
    }
}

