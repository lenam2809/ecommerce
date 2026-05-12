using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandById
{
    [Cacheable(CacheKeys.BrandDetail)]
    public class GetBrandByIdQuery : IRequest<Result<BrandDto>>
    {
        public Guid Id { get; set; }
    }
}

