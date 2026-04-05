namespace Ecommerce.Application.Features.Payments.VnPay.Dto
{
    public class PaymentResponseModel
    {
        public string OrderDescription { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public bool Success { get; set; }
        public bool SignatureValid { get; set; }
        public decimal Amount { get; set; }
        public string TxnRef { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string VnPayResponseCode { get; set; } = string.Empty;
    }
}
