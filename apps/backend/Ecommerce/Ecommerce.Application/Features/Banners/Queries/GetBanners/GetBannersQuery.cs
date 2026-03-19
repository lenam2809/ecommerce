using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Queries.GetBanners
{
    [Cacheable(CacheKeys.BannerAll, ECachePolicy.Long)]
    public class GetBannersQuery : IRequest<Result<List<BannerDto>>>
    {
    }
}

