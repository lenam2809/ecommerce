using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroomInventory
{
    public class UpdateShowroomInventoryCommand : IRequest<Result<ShowroomInventoryDto>>
    {
        public Guid ShowroomId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public int Quantity { get; set; }
        public int ReservedQuantity { get; set; }
        public bool IsAvailableFor2hDelivery { get; set; } = true;
    }
}
