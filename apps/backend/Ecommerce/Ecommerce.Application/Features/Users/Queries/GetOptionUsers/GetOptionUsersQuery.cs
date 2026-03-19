using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionUsers
{
    public class GetOptionUsersQuery : IRequest<Result<List<Option>>>
    {
    }
}

