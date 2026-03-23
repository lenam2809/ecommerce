using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandBySlug
{
    public class GetBrandBySlugQuery : IRequest<Result<BrandDto>>
    {
        public required string Slug { get; set; }
    }
}

