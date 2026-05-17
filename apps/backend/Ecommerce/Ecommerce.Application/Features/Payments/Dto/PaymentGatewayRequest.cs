namespace Ecommerce.Application.Features.Payments.Dto;

public sealed class PaymentGatewayRequest
{
    public string OrderType { get; init; } = "other";
    public decimal Amount { get; init; }
    public string OrderDescription { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string TransactionRef { get; init; } = string.Empty;
    public string ClientIpAddress { get; init; } = "127.0.0.1";
}
