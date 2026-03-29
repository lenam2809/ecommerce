using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Commands.ToggleMarqueeMessage
{
    public class ToggleMarqueeMessageCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}
