using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.PromoCodes.Dto
{
    public class PromoCodeSummaryDto : IMapFrom<PromoCode>
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PromoCodeType Type { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public bool IsActive { get; set; }
        public int UsageLimit { get; set; }
        public int TimesUsed { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<PromoCode, PromoCodeSummaryDto>()
                .ForMember(d => d.Type, opt => opt.MapFrom(s => s.Type));
        }
    }
}

