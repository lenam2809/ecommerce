using Ecommerce.Application.Features.Payments.VnPay.Dto;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Payments.VnPay
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(PaymentInformationModel model, HttpContext context);
        Task<PaymentResponseModel> PaymentExecuteAsync(IQueryCollection collections, CancellationToken cancellationToken = default);
    }
}
