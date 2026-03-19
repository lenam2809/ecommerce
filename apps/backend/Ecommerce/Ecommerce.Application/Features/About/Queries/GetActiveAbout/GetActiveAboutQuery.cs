using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetActiveAbout
{
    [Cacheable(CacheKeys.AboutActive, ECachePolicy.Long)]
    public record GetActiveAboutQuery : IRequest<Result<AboutDto>>;

}

