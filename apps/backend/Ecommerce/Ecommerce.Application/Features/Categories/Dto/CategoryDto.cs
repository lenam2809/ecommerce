using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Features.CategoryBrands.Dto;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Categories.Dto
{
    public class CategoryDto : IMapFrom<Category>
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public required string Slug { get; set; }
        public bool IsActive { get; set; }
        public Guid? ParentId { get; set; }
        public List<CategoryDto> Children { get; set; } = [];
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int ProductCount { get; set; }

        // Thêm danh sách CategoryBrands
        public List<CategoryBrandDto> CategoryBrands { get; set; } = [];

        // Thêm danh sách CategoryIds để dễ sử dụng
        public List<Guid> BrandIds { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Category, CategoryDto>()
                .ForMember(d => d.ProductCount, opt => opt.MapFrom(s => s.Products != null ? s.Products.Count : 0))
                .ForMember(dest => dest.CategoryBrands, opt => opt.MapFrom(src => src.CategoryBrands))
                .ForMember(dest => dest.BrandIds, opt => opt.MapFrom(src => src.CategoryBrands.Select(cb => cb.Brand).ToList()));
        }
    }
}

