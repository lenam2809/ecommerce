using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetAllBrands
{
    public class GetAllBrandsQuery : IRequest<Result<List<BrandDto>>>
    {
    }
}

