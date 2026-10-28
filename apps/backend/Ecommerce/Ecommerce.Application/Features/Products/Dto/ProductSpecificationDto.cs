using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductSpecificationDto : IMapFrom<ProductSpecification>
    {
        public Guid? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string SpecKey { get => Name; set => Name = value; }
        public string SpecValue { get => Value; set => Value = value; }
        public string GroupName { get; set; } = "Chung";
        public bool IsKeySpec { get; set; } = false;
        public int DisplayOrder { get; set; } = 0;
        public bool IsHighlight { get; set; } = false;
        public string? FilterKey { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductSpecification, ProductSpecificationDto>().ReverseMap();
        }
    }
}

