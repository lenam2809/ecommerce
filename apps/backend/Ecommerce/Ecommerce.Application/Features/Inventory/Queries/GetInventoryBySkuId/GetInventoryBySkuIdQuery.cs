using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Inventory.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Inventory.Queries.GetInventoryBySkuId
{
    public class GetInventoryBySkuIdQuery : IRequest<Result<List<InventoryItemDto>>>
    {
        public Guid ProductVariantSkuId { get; set; }
    }
}
