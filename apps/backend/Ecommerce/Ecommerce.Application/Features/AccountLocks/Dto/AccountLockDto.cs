using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using AutoMapper;

namespace Ecommerce.Application.Features.AccountLocks.Dto
{
    public class AccountLockDto : IMapFrom<AccountLock>
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public required string Reason { get; set; }
        public ELockType LockType { get; set; }
        public string LockTypeText { get; set; } = string.Empty;
        public DateTime LockedAt { get; set; }
        public DateTime? UnlockedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public string? LockedByUserName { get; set; }
        public string? UnlockedByUserName { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int? RemainingMinutes { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<AccountLock, AccountLockDto>()
                .ForMember(dest => dest.LockedByUserName, opt => opt.MapFrom(src => src.LockedByUser != null ? src.LockedByUser.FullName : null))
                .ForMember(dest => dest.UnlockedByUserName, opt => opt.MapFrom(src => src.UnlockedByUser != null ? src.UnlockedByUser.FullName : null));
        }
    }
}

