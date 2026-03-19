using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;
using AutoMapper;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductImageDto : IMapFrom<ProductImage>
    {
        public Guid ProductId { get; set; }
        public required string Images { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductImage, ProductImageDto>();
        }
    }
}

