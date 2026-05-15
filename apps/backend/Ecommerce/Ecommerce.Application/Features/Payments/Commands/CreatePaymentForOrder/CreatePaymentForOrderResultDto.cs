namespace Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder
{
    public class CreatePaymentForOrderResultDto
    {
        public Guid OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string TransactionRef { get; set; } = string.Empty;
        public string PaymentUrl { get; set; } = string.Empty;
    }
}
