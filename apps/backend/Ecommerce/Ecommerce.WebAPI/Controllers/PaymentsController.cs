using Ecommerce.Application.Features.Payments.VnPay;
using Ecommerce.Application.Features.Payments.VnPay.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;
        private readonly IConfiguration _configuration;

        public PaymentsController(IVnPayService vnPayService, IConfiguration configuration)
        {
            _vnPayService = vnPayService;
            _configuration = configuration;
        }

        [HttpPost("vnpay/create-url")]
        public IActionResult CreatePaymentUrl([FromBody] PaymentInformationModel model)
        {
            var url = _vnPayService.CreatePaymentUrl(model, HttpContext);
            return Ok(new { paymentUrl = url });
        }

        [HttpGet("vnpay/return")]
        public IActionResult PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);
            
            // Redirect to frontend with status
            var feBaseUrl = "http://localhost:3000"; // Should come from config
            var returnUrl = $"{feBaseUrl}/payment/vnpay-return?vnp_ResponseCode={response.VnPayResponseCode}&vnp_TransactionNo={response.TransactionId}&vnp_TxnRef={response.OrderId}&success={response.Success}";

            return Redirect(returnUrl);
        }
        
        [HttpGet("vnpay/ipn")]
        public IActionResult PaymentIpn()
        {
             // Optional: Handle Server to Server notification
             var response = _vnPayService.PaymentExecute(Request.Query);
             if (response.Success)
             {
                 // Update order status in database here
                 // await _mediator.Send(new UpdateOrderStatusCommand { ... })
                 return Ok(new { RspCode = "00", Message = "Confirm Success" });
             }
             
             return Ok(new { RspCode = "02", Message = "Order already confirmed" }); // Or error code
        }
    }
}
