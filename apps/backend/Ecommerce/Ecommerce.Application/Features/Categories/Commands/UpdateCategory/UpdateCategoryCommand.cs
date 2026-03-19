using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Categories.Commands.UpdateCategory
{
    public class UpdateCategoryCommand : IRequest<Result<Guid>>, IMapFrom<Category>
    {
        public Guid Id { get; set; }

        public string Code { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public Guid? ParentId { get; set; }

        public bool IsActive { get; set; }

        public IFormFile? Image { get; set; }


        // Thêm danh sách CategoryIds để liên kết với các Category
        public List<Guid> BrandIds { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateCategoryCommand, Category>()
                .ForMember(dest => dest.Image, opt => opt.Ignore())
                .ForMember(dest => dest.Children, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore())
                .ForMember(dest => dest.Parent, opt => opt.Ignore());
        }
    }
}

