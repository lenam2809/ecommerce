using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Categories.Commands.CreateCategory
{
    public class CreateCategoryCommand : IRequest<Result<Guid>>, IMapFrom<Category>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
        public string Slug { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;

        // Thêm danh sách BrandIds để liên kết với các Brand
        public List<Guid> BrandIds { get; set; } = [];
        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreateCategoryCommand, Category>()
                .ForMember(dest => dest.Image, opt => opt.Ignore())
                .ForMember(dest => dest.Children, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore())
                .ForMember(dest => dest.Parent, opt => opt.Ignore())
                .ForMember(dest => dest.CategoryBrands, opt => opt.Ignore());
        }
    }
}

