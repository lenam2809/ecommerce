using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Commands.DeleteMarqueeMessage
{
    public class DeleteMarqueeMessageCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
    }
}
