using Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder;
using Ecommerce.Application.Features.Payments.VnPay;
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
        private readonly IVnPayService _vnPayService;
        private readonly IConfiguration _configuration;

        public PaymentsController(IMediator mediator, IVnPayService vnPayService, IConfiguration configuration)
        {
            _mediator = mediator;
            _vnPayService = vnPayService;
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
            var response = await _vnPayService.PaymentExecuteAsync(Request.Query, cancellationToken);

            var feBaseUrl = _configuration["AppUrl:Frontend"] ?? _configuration["AppUrl"];
            if (string.IsNullOrWhiteSpace(feBaseUrl))
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Error = "Frontend URL is not configured." });
            }

            var returnUrl = $"{feBaseUrl.TrimEnd('/')}/payment/vnpay-return" +
                $"?vnp_ResponseCode={Uri.EscapeDataString(response.VnPayResponseCode)}" +
                $"&vnp_TransactionNo={Uri.EscapeDataString(response.TransactionId)}" +
                $"&vnp_TxnRef={Uri.EscapeDataString(response.OrderId)}" +
                $"&success={response.Success.ToString().ToLowerInvariant()}";

            return Redirect(returnUrl);
        }
        
        [HttpGet("vnpay/ipn")]
        public async Task<IActionResult> PaymentIpn(CancellationToken cancellationToken)
        {
             // Optional: Handle Server to Server notification
             var response = await _vnPayService.PaymentExecuteAsync(Request.Query, cancellationToken);
             if (response.Success)
             {
                 // Update order status in database here
                 // await _mediator.Send(new UpdateOrderStatusCommand { ... })
                 return Ok(new { RspCode = "00", Message = "Confirm Success" });
             }
             
             return Ok(new { RspCode = "02", Message = "Order already confirmed" }); // Or error code
        }
    }

    public class CreatePaymentUrlRequest
    {
        public Guid OrderId { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
