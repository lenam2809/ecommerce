using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.DeleteAbout
{
    public record DeleteAboutCommand : IRequest<Result<bool>>
    {
        public Guid Id { get; init; }
    }
}

