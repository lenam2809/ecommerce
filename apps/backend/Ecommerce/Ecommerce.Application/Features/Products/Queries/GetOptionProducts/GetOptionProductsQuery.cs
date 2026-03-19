using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionProducts
{
    public class GetOptionProductsQuery : IRequest<Result<List<Option>>>
    {
    }
}

