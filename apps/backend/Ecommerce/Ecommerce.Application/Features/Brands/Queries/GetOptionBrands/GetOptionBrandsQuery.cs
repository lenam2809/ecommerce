using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetOptionBrands
{
    public class GetOptionBrandsQuery : IRequest<Result<List<Option>>>
    {
    }
}

