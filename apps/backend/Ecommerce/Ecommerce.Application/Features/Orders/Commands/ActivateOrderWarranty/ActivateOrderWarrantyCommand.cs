using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;

namespace Ecommerce.Application.Features.Orders.Commands.ActivateOrderWarranty
{
    public class ActivateOrderWarrantyCommand : ICommand<Result<List<OrderItemSerialDto>>>
    {
        public Guid OrderId { get; set; }
        public Guid? OrderItemId { get; set; }
    }
}
