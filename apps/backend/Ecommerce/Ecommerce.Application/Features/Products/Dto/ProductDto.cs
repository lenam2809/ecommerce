using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductDto : IMapFrom<Product>
    {
        public Guid Id { get; set; }
        public required string Code { get; set; }
        public required string Sku { get; set; }
        public required string Name { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid CategoryId { get; set; }
        public required string CategoryName { get; set; }
        public required string CategorySlug { get; set; }
        public decimal? SalePrice { get; set; }
        public double Rating { get; set; }
        public int ReviewCount { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string MainImage { get; set; } = string.Empty;
        public List<string> AdditionalImages { get; set; } = [];
        public Guid BrandId { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public string BrandSlug { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        //số lượng đã bán
        public int SoldQuantity { get; set; }
        public List<SpecificationDto> Specifications { get; set; } = [];
        public List<string> Colors { get; set; } = [];
        public List<string> Sizes { get; set; } = [];
        public VariantsDto? Variants { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool AllowDelete { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Product, ProductDto>()
                .ForMember(d => d.CategoryName, opt => opt.MapFrom(s => s.Category.Name))
                .ForMember(d => d.CategorySlug, opt => opt.MapFrom(s => s.Category.Slug))
                .ForMember(d => d.BrandName, opt => opt.MapFrom(s => s.Brand.Name))
                .ForMember(d => d.BrandSlug, opt => opt.MapFrom(s => s.Brand.Slug))
                .ForMember(d => d.MainImage, opt => opt.MapFrom(s => s.Image))
                .ForMember(d => d.AdditionalImages, opt => opt.MapFrom(s => s.Images.Select(i => i.Url)))
                .ForMember(d => d.Variants, opt => opt.MapFrom(s => s.Variants))
                .ForMember(d => d.Colors, opt => opt.MapFrom(s => s.Variants.Colors.Select(c => c.Color)))
                .ForMember(d => d.Sizes, opt => opt.MapFrom(s => s.Variants.Sizes.Select(c => c.Size)))
                .ForMember(d => d.Specifications, opt => opt.MapFrom(s => s.Specifications));
        }
    }
}

