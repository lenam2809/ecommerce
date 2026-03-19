using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class VariantsDto : IMapFrom<ProductVariants>
    {
        public List<string> Colors { get; set; } = new();
        public List<string> Sizes { get; set; } = new();

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductVariants, VariantsDto>()
                .ForMember(d => d.Colors, opt => opt.MapFrom(s => s.Colors.Select(c => c.Color)))
                .ForMember(d => d.Sizes, opt => opt.MapFrom(s => s.Sizes.Select(sz => sz.Size)));
        }
    }

}

