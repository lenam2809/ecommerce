using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandsByCategoryId
{
    [Cacheable(CacheKeys.BrandAll)]
    public class GetBrandsByCategoryIdQuery : IRequest<Result<List<BrandDto>>>
    {
        public Guid CategoryId { get; set; }
    }
}

