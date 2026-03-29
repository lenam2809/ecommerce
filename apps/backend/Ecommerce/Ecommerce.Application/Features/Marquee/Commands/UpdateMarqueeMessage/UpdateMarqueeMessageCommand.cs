using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Marquee.Commands.UpdateMarqueeMessage
{
    public class UpdateMarqueeMessageCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? LinkUrl { get; set; }
        public string? Icon { get; set; }
        public int Speed { get; set; }
        public int Priority { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
