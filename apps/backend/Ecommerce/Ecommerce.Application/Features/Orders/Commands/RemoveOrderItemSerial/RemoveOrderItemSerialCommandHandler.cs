using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.RemoveOrderItemSerial
{
    public class RemoveOrderItemSerialCommandHandler : IRequestHandler<RemoveOrderItemSerialCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public RemoveOrderItemSerialCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<Unit>> Handle(RemoveOrderItemSerialCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var serial = await _unitOfWork.BaseRepository<OrderItemSerial>().GetQueryable()
                    .Include(s => s.OrderItem)
                    .FirstOrDefaultAsync(s => s.Id == request.SerialId, cancellationToken);

                if (serial == null)
                    return Result<Unit>.NotFound($"Không tìm thấy bản ghi Serial với ID {request.SerialId}");

                if (serial.OrderItem == null || serial.OrderItem.OrderId != request.OrderId)
                    return Result<Unit>.BadRequest("Mã Serial không thuộc đơn hàng được chỉ định");

                // Nếu có liên kết InventoryItem và đang Reserved thì giải phóng về Available
                if (serial.InventoryItemId.HasValue)
                {
                    var inventoryItem = await _unitOfWork.InventoryItems.GetByIdAsync(serial.InventoryItemId.Value, cancellationToken);
                    if (inventoryItem != null && inventoryItem.Status == EInventoryStatus.Reserved)
                    {
                        inventoryItem.Release();
                    }
                }

                _unitOfWork.BaseRepository<OrderItemSerial>().Delete(serial);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Removed serial {SerialId} ({SerialNumber}) from Order {OrderId}",
                    "RemoveOrderItemSerial",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", request.OrderId },
                        { "SerialId", request.SerialId },
                        { "SerialNumber", serial.SerialNumber }
                    });

                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi xóa mã Serial/IMEI");
                return Result<Unit>.BadRequest($"Không thể xóa mã Serial/IMEI: {ex.Message}");
            }
        }
    }
}
