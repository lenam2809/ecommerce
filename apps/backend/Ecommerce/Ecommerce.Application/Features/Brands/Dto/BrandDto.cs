using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Brands.Dto
{
    public class BrandDto : IMapFrom<Brand>
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public required string Slug { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ProductCount { get; set; }
        public int CategoryCount { get; set; }

        // Thêm danh sách CategoryBrands
        public List<CategoryBrandDto> CategoryBrands { get; set; } = [];

        // Thêm danh sách CategoryIds để dễ sử dụng
        public List<Guid> CategoryIds { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Brand, BrandDto>()
                .ForMember(dest => dest.CategoryBrands, opt => opt.MapFrom(src => src.CategoryBrands))
                .ForMember(dest => dest.CategoryIds, opt => opt.MapFrom(src => src.CategoryBrands.Select(cb => cb.CategoryId).ToList()));
        }
    }
}

