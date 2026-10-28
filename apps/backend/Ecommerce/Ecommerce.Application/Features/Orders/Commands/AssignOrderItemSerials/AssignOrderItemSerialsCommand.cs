using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;

namespace Ecommerce.Application.Features.Orders.Commands.AssignOrderItemSerials
{
    public class AssignOrderItemSerialsCommand : ICommand<Result<OrderItemSerialDto>>
    {
        public Guid OrderId { get; set; }
        public Guid OrderItemId { get; set; }
        public string SerialNumber { get; set; } = string.Empty;
        public string? Imei { get; set; }
        public int? WarrantyMonths { get; set; }
    }
}
