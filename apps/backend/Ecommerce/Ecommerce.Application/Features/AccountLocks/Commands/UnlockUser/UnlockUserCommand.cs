using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.UnlockUser
{
    public class UnlockUserCommand : IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
    }
}

