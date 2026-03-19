using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.PromoCodes.Dto
{
    public class PromoCodeDto : IMapFrom<PromoCode>
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Description { get; set; }
        public required string Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public int TimesUsed { get; set; }
        public bool IsActive { get; set; }
        public bool IsExpired => DateTime.Now > ValidTo;
        public bool IsAvailable => IsActive && !IsExpired && (UsageLimit == 0 || TimesUsed < UsageLimit);

        public void Mapping(Profile profile)
        {
            profile.CreateMap<PromoCode, PromoCodeDto>()
                .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type.ToString()));
        }
    }
}

