using Ecommerce.Application.Features.Payments.Dto;

namespace Ecommerce.Application.Common.Interfaces;

public interface IPaymentGateway
{
    string CreatePaymentUrl(PaymentGatewayRequest request);
    PaymentGatewayCallback ParseCallback(IReadOnlyDictionary<string, string> parameters);
}
