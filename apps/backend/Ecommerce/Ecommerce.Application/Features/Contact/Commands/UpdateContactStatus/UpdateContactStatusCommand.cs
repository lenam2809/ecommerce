using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Contact.Commands.UpdateContactStatus
{
    public record UpdateContactStatusCommand(Guid Id, bool IsActive) : IRequest<Result<bool>>;

}

