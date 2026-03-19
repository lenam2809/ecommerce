using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLocks
{
    public class GetAccountLocksQueryHandler : IRequestHandler<GetAccountLocksQuery, Result<PaginatedList<AccountLockDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetAccountLocksQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PaginatedList<AccountLockDto>>> Handle(GetAccountLocksQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Build filter expression
                Expression<Func<AccountLock, bool>> filter = al =>
                    (!request.IsActive.HasValue || al.IsActive == request.IsActive.Value) &&
                    (!request.LockType.HasValue || al.LockType == request.LockType.Value) &&
                    (!request.StartDate.HasValue || al.LockedAt >= request.StartDate.Value) &&
                    (!request.EndDate.HasValue || al.LockedAt <= request.EndDate.Value) &&
                    (string.IsNullOrEmpty(request.SearchTerm) ||
                     al.User.UserName.Contains(request.SearchTerm) ||
                     al.User.Email.Contains(request.SearchTerm) ||
                     al.Reason.Contains(request.SearchTerm));

                // Build ordering
                Func<IQueryable<AccountLock>, IOrderedQueryable<AccountLock>> orderBy = query =>
                {
                    return request.SortBy.ToLower() switch
                    {
                        "username" => request.IsDescending
                            ? query.OrderByDescending(al => al.User.UserName)
                            : query.OrderBy(al => al.User.UserName),
                        "locktype" => request.IsDescending
                            ? query.OrderByDescending(al => al.LockType)
                            : query.OrderBy(al => al.LockType),
                        "reason" => request.IsDescending
                            ? query.OrderByDescending(al => al.Reason)
                            : query.OrderBy(al => al.Reason),
                        "expiresat" => request.IsDescending
                            ? query.OrderByDescending(al => al.ExpiresAt)
                            : query.OrderBy(al => al.ExpiresAt),
                        "lockedat" => request.IsDescending
                            ? query.OrderByDescending(al => al.LockedAt)
                            : query.OrderBy(al => al.LockedAt),
                        _ => query.OrderByDescending(al => al.LockedAt)
                    };
                };

                // Get paginated data
                var paginatedResult = await _unitOfWork.AccountLocks
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: al => al
                            .Include(x => x.User)
                            .Include(x => x.LockedByUser)
                            .Include(x => x.UnlockedByUser));

                // Map to DTOs
                var lockDtos = paginatedResult.Items.Select(al => new AccountLockDto
                {
                    Id = al.Id,
                    UserId = al.UserId,
                    UserName = al.User?.UserName,
                    UserEmail = al.User?.Email,
                    Reason = al.Reason,
                    LockType = al.LockType,
                    LockTypeText = al.LockType.ToString(),
                    LockedAt = al.LockedAt,
                    UnlockedAt = al.UnlockedAt,
                    ExpiresAt = al.ExpiresAt,
                    IsActive = al.IsActive,
                    LockedByUserName = al.LockedByUser?.UserName,
                    UnlockedByUserName = al.UnlockedByUser?.UserName,
                    Notes = al.Notes,
                    RemainingMinutes = al.ExpiresAt.HasValue && al.IsActive
                        ? Math.Max(0, (int)(al.ExpiresAt.Value - DateTime.Now).TotalMinutes)
                        : null
                }).ToList();

                var result = new PaginatedList<AccountLockDto>(
                    lockDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<AccountLockDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<AccountLockDto>>.BadRequest(ex.Message);
            }
        }
    }
}

