using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder
{
    public class CreatePaymentForOrderCommandHandler : IRequestHandler<CreatePaymentForOrderCommand, Result<CreatePaymentForOrderResultDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPaymentGateway _paymentGateway;

        public CreatePaymentForOrderCommandHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IPaymentGateway paymentGateway)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _paymentGateway = paymentGateway;
        }

        public async Task<Result<CreatePaymentForOrderResultDto>> Handle(CreatePaymentForOrderCommand request, CancellationToken cancellationToken)
        {
            if (!string.Equals(request.PaymentMethod, "VNPay", StringComparison.OrdinalIgnoreCase))
            {
                return Result<CreatePaymentForOrderResultDto>.BadRequest("Phương thức thanh toán không được hỗ trợ.");
            }

            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
            {
                return Result<CreatePaymentForOrderResultDto>.Unauthorized("Vui lòng đăng nhập để thanh toán đơn hàng.");
            }

            var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId, cancellationToken);
            if (order == null)
            {
                return Result<CreatePaymentForOrderResultDto>.NotFound("Không tìm thấy đơn hàng.");
            }

            if (!order.ApplicationUserId.HasValue)
            {
                return Result<CreatePaymentForOrderResultDto>.Forbidden("Thanh toán VNPay cho guest order chưa được hỗ trợ an toàn.");
            }

            if (order.ApplicationUserId.Value != currentUserId.Value)
            {
                return Result<CreatePaymentForOrderResultDto>.Forbidden("Bạn không có quyền thanh toán đơn hàng này.");
            }

            if (order.Status != EOrderStatus.Pending)
            {
                return Result<CreatePaymentForOrderResultDto>.BadRequest("Đơn hàng hiện không ở trạng thái có thể thanh toán.");
            }

            if (order.TotalAmount <= 0)
            {
                return Result<CreatePaymentForOrderResultDto>.BadRequest("Số tiền thanh toán không hợp lệ.");
            }

            var hasSuccessfulPayment = await _unitOfWork.BaseRepository<Payment>()
                .AnyAsync(payment => payment.OrderId == order.Id && payment.IsSuccessful, cancellationToken);
            if (hasSuccessfulPayment)
            {
                return Result<CreatePaymentForOrderResultDto>.BadRequest("Đơn hàng đã được thanh toán.");
            }

            var transactionRef = order.Id.ToString("D");
            var paymentRequest = new PaymentGatewayRequest
            {
                TransactionRef = transactionRef,
                Amount = order.TotalAmount,
                CustomerName = order.Email,
                OrderDescription = $"Thanh toán đơn hàng {order.Code}",
                OrderType = "other",
                ClientIpAddress = request.ClientIpAddress
            };

            var paymentUrl = _paymentGateway.CreatePaymentUrl(paymentRequest);

            return Result<CreatePaymentForOrderResultDto>.Success(new CreatePaymentForOrderResultDto
            {
                OrderId = order.Id,
                OrderCode = order.Code,
                Amount = order.TotalAmount,
                PaymentMethod = "VNPay",
                TransactionRef = transactionRef,
                PaymentUrl = paymentUrl
            });
        }
    }
}
