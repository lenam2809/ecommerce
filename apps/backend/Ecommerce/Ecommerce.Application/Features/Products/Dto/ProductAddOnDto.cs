using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Features.Products.Dto
{
    public class ProductAddOnDto : IMapFrom<ProductAddOn>
    {
        public Guid Id { get; set; }
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string AddOnType { get; set; } = "ExtendedWarranty";
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? DurationMonths { get; set; }
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<ProductAddOn, ProductAddOnDto>();
        }
    }
}
