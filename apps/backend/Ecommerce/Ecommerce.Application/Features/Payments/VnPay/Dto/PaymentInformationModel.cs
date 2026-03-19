namespace Ecommerce.Application.Features.Payments.VnPay.Dto
{
    public class PaymentInformationModel
    {
        public string OrderType { get; set; } = "other";
        public double Amount { get; set; }
        public string OrderDescription { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
    }
}
