using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Queries.GetBannerById
{
    public class GetBannerByIdQuery : IRequest<Result<BannerDto>>
    {
        public Guid Id { get; set; }
    }
}

