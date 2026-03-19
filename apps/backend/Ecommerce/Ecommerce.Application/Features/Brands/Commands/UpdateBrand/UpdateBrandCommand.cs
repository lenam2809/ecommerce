using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Brands.Commands.UpdateBrand
{
    public class UpdateBrandCommand : IRequest<Result<bool>>, IMapFrom<Brand>
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IFormFile? Logo { get; set; }
        public bool IsActive { get; set; } = true;

        // Thêm danh sách CategoryIds để liên kết với các Category
        public List<Guid> CategoryIds { get; set; } = [];

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateBrandCommand, Brand>();
        }
    }
}

