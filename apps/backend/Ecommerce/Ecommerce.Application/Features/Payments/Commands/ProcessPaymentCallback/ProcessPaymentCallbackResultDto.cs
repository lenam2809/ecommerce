namespace Ecommerce.Application.Features.Payments.Commands.ProcessPaymentCallback;

public sealed class ProcessPaymentCallbackResultDto
{
    public string TransactionRef { get; set; } = string.Empty;
    public string GatewayTransactionId { get; set; } = string.Empty;
    public string GatewayResponseCode { get; set; } = string.Empty;
    public bool Success { get; set; }
}
