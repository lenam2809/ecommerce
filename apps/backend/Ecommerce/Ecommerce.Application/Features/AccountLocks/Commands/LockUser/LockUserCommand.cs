using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using MediatR;

namespace Ecommerce.Application.Features.AccountLocks.Commands.LockUser
{
    public class LockUserCommand : IRequest<Result<bool>>
    {
        public Guid UserId { get; set; }
        public required string Reason { get; set; }
        public ELockType LockType { get; set; } = ELockType.Temporary;
        public int? DurationMinutes { get; set; } // Chỉ áp dụng cho Temporary lock
        public string Notes { get; set; } = string.Empty;
    }
}

