using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.AccountLocks.Dto;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Queries.GetAccountLocks
{
    public class GetAccountLocksQuery : IRequest<Result<PaginatedList<AccountLockDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public bool? IsActive { get; set; } // null = tất cả, true = đang khóa, false = đã mở
        public ELockType? LockType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
        public string SortBy { get; set; } = "LockedAt";
        public bool IsDescending { get; set; } = true;
    }
}

