using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderDepositStatus
{
    public class UpdateOrderDepositStatusCommand : ICommand<Result<OrderDto>>
    {
        public Guid OrderId { get; set; }
        public EDepositStatus DepositStatus { get; set; }
        public decimal? DepositAmount { get; set; }
        public string? CarrierName { get; set; }
        public string? TrackingNumber { get; set; }
        public string? DriverName { get; set; }
        public string? DriverPhone { get; set; }
    }
}
