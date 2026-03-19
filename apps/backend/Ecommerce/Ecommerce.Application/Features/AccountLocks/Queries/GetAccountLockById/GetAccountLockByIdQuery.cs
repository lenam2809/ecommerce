using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLockById
{
    public record GetAccountLockByIdQuery(Guid Id) : IRequest<Result<AccountLockDto>>;

}

