namespace Ecommerce.Application.Features.Payments.Dto;

public sealed class PaymentGatewayCallback
{
    public string OrderDescription { get; set; } = string.Empty;
    public string GatewayTransactionId { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public bool Success { get; set; }
    public bool SignatureValid { get; set; }
    public decimal Amount { get; set; }
    public string TransactionRef { get; set; } = string.Empty;
    public string SecureHash { get; set; } = string.Empty;
    public string GatewayResponseCode { get; set; } = string.Empty;
    public DateTime? CreatedAtUtc { get; set; }
}
