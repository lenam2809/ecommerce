using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.About.Commands.UpdateAboutStatus
{
    public record UpdateAboutStatusCommand(Guid Id, bool IsActive) : IRequest<Result<bool>>;

}

