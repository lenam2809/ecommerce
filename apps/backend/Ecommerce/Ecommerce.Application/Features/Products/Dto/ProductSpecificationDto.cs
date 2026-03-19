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
        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductSpecificationDto, ProductSpecification>();
        }
    }
}

