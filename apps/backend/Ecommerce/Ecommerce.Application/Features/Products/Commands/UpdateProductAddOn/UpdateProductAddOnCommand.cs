using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.UpdateProductAddOn
{
    public class UpdateProductAddOnCommand : IRequest<Result<Unit>>, IMapFrom<ProductAddOn>
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
        public int DisplayOrder { get; set; } = 0;

        public void Mapping(Profile profile)
        {
            profile.CreateMap<UpdateProductAddOnCommand, ProductAddOn>();
        }
    }
}
