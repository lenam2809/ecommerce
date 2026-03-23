using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Products.Commands.UpdateProduct
{
    public class UpdateProductCommand : IRequest<Result<Unit>>, IMapFrom<Product>
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Sku { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public decimal? SalePrice { get; set; }

        public double Rating { get; set; }

        public int ReviewCount { get; set; }

        public string Description { get; set; } = string.Empty;

        public int StockQuantity { get; set; }

        public DateTime? PublishedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid CategoryId { get; set; }

        public Guid BrandId { get; set; }

        // Hình ảnh đại diện chính (có thể null nếu không muốn cập nhật)
        public IFormFile? MainImage { get; set; }

        // Danh sách các hình ảnh phụ cần thêm mới từ File
        public List<IFormFile> AdditionalImages { get; set; } = new List<IFormFile>();

        // Danh sách các hình ảnh phụ từ URL (đã upload trước đó hoặc từ Supabase)
        public List<string> AdditionalImageUrls { get; set; } = new List<string>();

        // Danh sách ID hình ảnh cần xóa
        public List<Guid> ImageIdsToDelete { get; set; } = new List<Guid>();

        // Danh sách thông số kỹ thuật mới hoặc cập nhật
        public List<ProductSpecificationDto> Specifications { get; set; } = new List<ProductSpecificationDto>();

        // Danh sách ID của thông số kỹ thuật cần xóa
        public List<Guid> SpecificationIdsToDelete { get; set; } = new List<Guid>();

        // Variants
        public List<string> Colors { get; set; } = new List<string>();
        public List<string> Sizes { get; set; } = new List<string>();

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateProductCommand, Product>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Specifications, opt => opt.Ignore())
                .ForMember(dest => dest.Variants, opt => opt.Ignore())
                .ForMember(dest => dest.Image, opt => opt.Ignore());
        }
    }

}

