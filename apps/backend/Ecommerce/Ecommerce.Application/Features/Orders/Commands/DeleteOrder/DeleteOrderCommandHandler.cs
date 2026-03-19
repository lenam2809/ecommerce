using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Orders.Commands.DeleteOrder
{
    public class DeleteOrderCommandHandler : IRequestHandler<DeleteOrderCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public DeleteOrderCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Unit>> Handle(DeleteOrderCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await _unitOfWork.Orders.GetByIdAsync(request.Id, cancellationToken);

                if (order == null)
                {
                    return Result<Unit>.NotFound($"Không tìm thấy đơn hàng với ID {request.Id}");
                }

                // Only allow deletion of pending orders that haven't been processed yet
                if (order.Status != EOrderStatus.Pending)
                {
                    return Result<Unit>.BadRequest("Chỉ có thể xóa đơn hàng đang ở trạng thái chờ xử lý");
                }

                // Restore product stock quantities
                foreach (var item in order.OrderItems)
                {
                    var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId, cancellationToken);
                    if (product != null)
                    {
                        product.AdjustStock(item.Quantity);
                        _unitOfWork.Products.Update(product);
                    }
                }

                // Delete the order
                _unitOfWork.Orders.Delete(order);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    $"Đơn hàng đã được xóa. ID: {order.Id}, Mã: {order.Code}",
                    "Xóa đơn hàng");

                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi xóa đơn hàng");
                return Result<Unit>.BadRequest($"Xóa đơn hàng thất bại: {ex.Message}");
            }
        }
    }
}

