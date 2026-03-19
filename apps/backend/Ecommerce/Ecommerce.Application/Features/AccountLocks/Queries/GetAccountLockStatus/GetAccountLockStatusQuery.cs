using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockStatus
{
    public class GetAccountLockStatusQuery : IRequest<Result<AccountLockDto>>
    {
        public Guid UserId { get; set; }
    }
}

