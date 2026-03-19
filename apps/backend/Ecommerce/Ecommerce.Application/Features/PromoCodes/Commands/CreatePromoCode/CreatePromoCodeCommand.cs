using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.PromoCodes.Commands.CreatePromoCode
{
    public class CreatePromoCodeCommand : IRequest<Result<Guid>>, IMapFrom<PromoCode>
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool FreeShipping { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; } = true;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreatePromoCodeCommand, PromoCode>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src =>
                    Enum.Parse<PromoCodeType>(src.Type)));
        }
    }
}

