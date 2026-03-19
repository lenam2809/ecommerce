using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using System.ComponentModel;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductImportExportDto : IMapFrom<Product>
    {
        [DisplayName("Hành động")]
        public string Action { get; set; } = "ADD";

        [DisplayName("ID sản phẩm")]
        public Guid? Id { get; set; }

        [DisplayName("Mã sản phẩm")]
        public string Code { get; set; } = string.Empty;

        [DisplayName("Tên sản phẩm")]
        public string Name { get; set; } = string.Empty;

        [DisplayName("SKU")]
        public string Sku { get; set; } = string.Empty;

        [DisplayName("Giá gốc")]
        public decimal Price { get; set; }

        [DisplayName("Giá khuyến mãi")]
        public decimal? SalePrice { get; set; }

        [DisplayName("Đánh giá")]
        public double Rating { get; set; }

        [DisplayName("Số lượt đánh giá")]
        public int ReviewCount { get; set; }

        [DisplayName("Mô tả")]
        public string? Description { get; set; }

        [DisplayName("Số lượng tồn kho")]
        public int StockQuantity { get; set; }

        [DisplayName("Ngày xuất bản")]
        public DateTime? PublishedDate { get; set; }

        [DisplayName("Trạng thái hoạt động")]
        public bool IsActive { get; set; }

        [DisplayName("ID danh mục")]
        public Guid? CategoryId { get; set; }

        [DisplayName("Tên danh mục")]
        public string? CategoryName { get; set; }

        [DisplayName("ID thương hiệu")]
        public Guid? BrandId { get; set; }

        [DisplayName("Tên thương hiệu")]
        public string? BrandName { get; set; }

        [DisplayName("Hình ảnh chính")]
        public string? Image { get; set; }

        [DisplayName("Hình ảnh bổ sung")]
        public string? AdditionalImages { get; set; }

        [DisplayName("Màu sắc")]
        public string? Colors { get; set; }

        [DisplayName("Kích thước")]
        public string? Sizes { get; set; }

        [DisplayName("Thông số kỹ thuật")]
        public string? Specifications { get; set; }

        public void Mapping(AutoMapper.Profile profile)
        {
            profile.CreateMap<Product, ProductImportExportDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.BrandName, opt => opt.MapFrom(src => src.Brand.Name))
                .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.Image))
                .ForMember(dest => dest.AdditionalImages, opt => opt.Ignore())
                .ForMember(dest => dest.Colors, opt => opt.Ignore())
                .ForMember(dest => dest.Sizes, opt => opt.Ignore())
                .ForMember(dest => dest.Specifications, opt => opt.Ignore())
                .ForMember(dest => dest.Action, opt => opt.Ignore());

            profile.CreateMap<ProductImportExportDto, Product>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Specifications, opt => opt.Ignore())
                .ForMember(dest => dest.Variants, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Brand, opt => opt.Ignore())
                .ForMember(dest => dest.Reviews, opt => opt.Ignore());
        }
    }
}
