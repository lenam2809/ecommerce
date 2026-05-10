using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.SendOrderEmail
{
    public sealed class SendOrderEmailCommandHandler : IRequestHandler<SendOrderEmailCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailQueue _emailQueue;
        private readonly IEmailTemplateRenderer _templateRenderer;

        public SendOrderEmailCommandHandler(
            IUnitOfWork unitOfWork,
            IEmailQueue emailQueue,
            IEmailTemplateRenderer templateRenderer)
        {
            _unitOfWork = unitOfWork;
            _emailQueue = emailQueue;
            _templateRenderer = templateRenderer;
        }

        public async Task<Result<Unit>> Handle(SendOrderEmailCommand request, CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAndProductsAsync(request.OrderId, cancellationToken);
            if (order == null)
            {
                return Result<Unit>.NotFound("Order not found.");
            }

            if (string.IsNullOrWhiteSpace(order.Email))
            {
                return Result<Unit>.BadRequest("Order does not have a customer email.");
            }

            var customerName = order.ApplicationUser != null
                ? $"{order.ApplicationUser.FirstName} {order.ApplicationUser.LastName}".Trim()
                : order.GuestName ?? "Customer";

            var body = await _templateRenderer.RenderAsync("OrderConfirmation", new Dictionary<string, string>
            {
                ["CustomerName"] = customerName,
                ["OrderCode"] = order.Code,
                ["OrderDate"] = order.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                ["ItemCount"] = order.OrderItems.Count.ToString(),
                ["TotalAmount"] = order.TotalAmount.ToString("N0"),
                ["TrackingUrl"] = $"/orders/{order.Id}"
            }, cancellationToken);

            await _emailQueue.QueueEmailAsync(new EmailMessage(
                order.Email,
                $"ShopViet xac nhan don hang {order.Code}",
                body,
                $"Don hang {order.Code} da duoc ghi nhan."), cancellationToken);

            return Result<Unit>.Success(Unit.Value);
        }
    }
}
