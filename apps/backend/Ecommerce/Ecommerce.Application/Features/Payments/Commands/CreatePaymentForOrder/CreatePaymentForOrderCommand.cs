using Ecommerce.Application.Common.Models;
using MediatR;

using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder
{
    public class CreatePaymentForOrderCommand : ICommand<Result<CreatePaymentForOrderResultDto>>
    {
        public Guid OrderId { get; set; }
        public string PaymentMethod { get; set; } = "VNPay";
        public string ClientIpAddress { get; set; } = "127.0.0.1";
    }
}
