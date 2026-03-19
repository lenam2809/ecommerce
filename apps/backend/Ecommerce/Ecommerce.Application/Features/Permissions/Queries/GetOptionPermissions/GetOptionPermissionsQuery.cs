using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionPermissions
{
    public class GetOptionPermissionsQuery : IRequest<Result<List<Option>>>
    {
    }
}

