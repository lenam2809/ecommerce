using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug
{
    [Cacheable(CacheKeys.BrandDetail)]
    public class GetBrandBySlugQuery : IRequest<Result<BrandDto>>
    {
        public required string Slug { get; set; }
    }
}

