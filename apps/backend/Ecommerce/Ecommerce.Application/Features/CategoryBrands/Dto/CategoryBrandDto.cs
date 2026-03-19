using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.CategoryBrands.Dto
{
    public class CategoryBrandDto : IMapFrom<CategoryBrand>
    {
        public Guid CategoryId { get; set; }
        public Guid BrandId { get; set; }
        public DateTime LinkedAt { get; set; }

        // Navigation properties
        public string CategoryName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;


        public void Mapping(Profile profile)
        {
            profile.CreateMap<CategoryBrand, CategoryBrandDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand != null ? src.Brand.Name : string.Empty));
        }
    }
}

