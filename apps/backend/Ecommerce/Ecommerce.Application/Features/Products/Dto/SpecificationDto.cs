using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class SpecificationDto : IMapFrom<ProductSpecification>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string SpecKey { get => Name; set => Name = value; }
        public string SpecValue { get => Value; set => Value = value; }
        public string GroupName { get; set; } = "Chung";
        public bool IsKeySpec { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsHighlight { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductSpecification, SpecificationDto>()
                .ForMember(d => d.Id, opt => opt.MapFrom(s => s.Id));
        }
    }
}

