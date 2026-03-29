using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Marquee.DTOs;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Queries.GetAllMarqueeAdmin
{
    public class GetAllMarqueeAdminQuery : IRequest<Result<AdminMarqueeResponseDto>>
    {
    }
}
