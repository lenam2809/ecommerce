using Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder;
using Ecommerce.Application.Features.Payments.Commands.ProcessPaymentCallback;
using Ecommerce.WebAPI.Extensions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IConfiguration _configuration;

        public PaymentsController(IMediator mediator, IConfiguration configuration)
        {
            _mediator = mediator;
            _configuration = configuration;
        }

        [HttpPost("vnpay/create-url")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentUrl([FromBody] CreatePaymentUrlRequest request, CancellationToken cancellationToken)
        {
            var command = new CreatePaymentForOrderCommand
            {
                OrderId = request.OrderId,
                PaymentMethod = request.PaymentMethod ?? "VNPay",
                ClientIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1"
            };

            var result = await _mediator.Send(command, cancellationToken);
            return result.ToActionResult();
        }

        [HttpGet("vnpay/return")]
        public async Task<IActionResult> PaymentCallback(CancellationToken cancellationToken)
        {
            var response = await ProcessPaymentCallbackAsync(cancellationToken);

            var feBaseUrl = _configuration["AppUrl:Frontend"] ?? _configuration["AppUrl"];
            if (string.IsNullOrWhiteSpace(feBaseUrl))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Error = "Frontend URL is not configured." });
            }

            var returnUrl = $"{feBaseUrl.TrimEnd('/')}/payment/vnpay-return" +
                $"?vnp_ResponseCode={Uri.EscapeDataString(response.GatewayResponseCode)}" +
                $"&vnp_TransactionNo={Uri.EscapeDataString(response.GatewayTransactionId)}" +
                $"&vnp_TxnRef={Uri.EscapeDataString(response.TransactionRef)}" +
                $"&success={response.Success.ToString().ToLowerInvariant()}";

            return Redirect(returnUrl);
        }
        
        [HttpGet("vnpay/ipn")]
        public async Task<IActionResult> PaymentIpn(CancellationToken cancellationToken)
        {
            var response = await ProcessPaymentCallbackAsync(cancellationToken);
            return Ok(ToVnPayIpnResult(response));
        }

        private async Task<ProcessPaymentCallbackResultDto> ProcessPaymentCallbackAsync(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new ProcessPaymentCallbackCommand
            {
                Parameters = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString())
            }, cancellationToken);

            return result.Value;
        }

        private static object ToVnPayIpnResult(ProcessPaymentCallbackResultDto response)
        {
            if (response.Success)
            {
                return new { RspCode = "00", Message = "Confirm Success" };
            }

            return response.GatewayResponseCode switch
            {
                "INVALID_SIGNATURE" => new { RspCode = "97", Message = "Invalid signature" },
                "ORDER_NOT_FOUND" => new { RspCode = "01", Message = "Order not found" },
                "AMOUNT_MISMATCH" => new { RspCode = "04", Message = "Invalid amount" },
                "EXPIRED_CALLBACK" => new { RspCode = "99", Message = "Expired callback" },
                "ORDER_NOT_PAYABLE" => new { RspCode = "02", Message = "Order not payable" },
                _ => new { RspCode = "00", Message = "Confirm Success" }
            };
        }
    }

    public class CreatePaymentUrlRequest
    {
        public Guid OrderId { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
