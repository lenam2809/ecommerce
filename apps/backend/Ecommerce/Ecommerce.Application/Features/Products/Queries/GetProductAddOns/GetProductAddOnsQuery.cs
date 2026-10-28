using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Products.Queries.GetProductAddOns
{
    public class GetProductAddOnsQuery : IRequest<Result<List<ProductAddOnDto>>>
    {
        public Guid? ProductId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public string? AddOnType { get; set; }
        public bool? IsActive { get; set; }
    }
}
