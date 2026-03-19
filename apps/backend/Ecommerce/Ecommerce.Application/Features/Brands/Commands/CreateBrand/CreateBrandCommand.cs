using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Brands.Commands.CreateBrand
{
    public class CreateBrandCommand : IRequest<Result<Guid>>, IMapFrom<Brand>
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Logo { get; set; }
        public bool IsActive { get; set; } = true;


        // Thêm danh sách CategoryIds để liên kết với các Category
        public List<Guid> CategoryIds { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<CreateBrandCommand, Brand>()
                .ForMember(dest => dest.LogoUrl, opt => opt.Ignore())
                .ForMember(dest => dest.Products, opt => opt.Ignore())
                .ForMember(dest => dest.CategoryBrands, opt => opt.Ignore());
        }
    }
}

