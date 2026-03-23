using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Products.Commands.CreateProduct
{
    public class CreateProductCommand : IRequest<Result<Guid>>, IMapFrom<Product>
    {
        public required string Code { get; set; }

        public required string Name { get; set; }

        public required string Sku { get; set; }

        public decimal Price { get; set; }

        public decimal? SalePrice { get; set; }

        public double Rating { get; set; }

        public int ReviewCount { get; set; }

        public required string Description { get; set; }

        public int StockQuantity { get; set; }

        public DateTime? PublishedDate { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid CategoryId { get; set; }

        public Guid BrandId { get; set; }

        // Hình ảnh đại diện chính (File)
        public required IFormFile MainImage { get; set; }

        // Danh sách các hình ảnh phụ (File)
        public List<IFormFile> AdditionalImages { get; set; } = new List<IFormFile>();

        // Danh sách các hình ảnh phụ (URL)
        public List<string> AdditionalImageUrls { get; set; } = new List<string>();

        // Danh sách thông số kỹ thuật
        public List<ProductSpecificationDto> Specifications { get; set; } = new List<ProductSpecificationDto>();

        // Variants
        public List<string> Colors { get; set; } = [];
        public List<string> Sizes { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreateProductCommand, Product>()
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Specifications, opt => opt.Ignore())
                .ForMember(dest => dest.Variants, opt => opt.Ignore())
                .ForMember(dest => dest.Image, opt => opt.MapFrom(src => src.MainImage));
        }
    }


}

