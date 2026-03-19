using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Queries.GetBrandById
{
    public class GetBrandByIdQuery : IRequest<Result<BrandDto>>
    {
        public Guid Id { get; set; }
    }
}

