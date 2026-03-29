using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Commands.ToggleGlobalMarquee
{
    public class ToggleGlobalMarqueeCommand : IRequest<Result<bool>>
    {
    }
}
