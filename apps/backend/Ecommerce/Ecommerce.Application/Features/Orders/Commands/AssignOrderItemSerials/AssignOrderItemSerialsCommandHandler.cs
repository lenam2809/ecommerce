using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Commands.AssignOrderItemSerials
{
    public class AssignOrderItemSerialsCommandHandler : IRequestHandler<AssignOrderItemSerialsCommand, Result<OrderItemSerialDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public AssignOrderItemSerialsCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<OrderItemSerialDto>> Handle(AssignOrderItemSerialsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var cleanSerial = request.SerialNumber.Trim();
                var cleanImei = string.IsNullOrWhiteSpace(request.Imei) ? null : request.Imei.Trim();

                // 1. Kiểm tra Order và OrderItem
                var order = await _unitOfWork.Orders.GetQueryable()
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.OrderItemSerials)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                    return Result<OrderItemSerialDto>.NotFound($"Không tìm thấy đơn hàng với ID {request.OrderId}");

                var orderItem = order.OrderItems.FirstOrDefault(oi => oi.Id == request.OrderItemId);
                if (orderItem == null)
                    return Result<OrderItemSerialDto>.NotFound($"Không tìm thấy mục hàng {request.OrderItemId} trong đơn hàng");

                // Kiểm tra xem Serial này đã gán vào OrderItem này chưa
                if (orderItem.OrderItemSerials.Any(s => s.SerialNumber.Equals(cleanSerial, StringComparison.OrdinalIgnoreCase)))
                {
                    return Result<OrderItemSerialDto>.BadRequest($"Mã Serial '{cleanSerial}' đã được gán cho mục hàng này.");
                }

                // 2. Tra cứu InventoryItem trong kho (nếu có)
                var inventoryItem = await _unitOfWork.InventoryItems.GetQueryable()
                    .FirstOrDefaultAsync(ii => ii.SerialNumber == cleanSerial, cancellationToken);

                if (inventoryItem != null)
                {
                    if (inventoryItem.Status == EInventoryStatus.Available)
                    {
                        inventoryItem.Reserve(orderItem.Id);
                    }
                    if (string.IsNullOrEmpty(cleanImei) && !string.IsNullOrEmpty(inventoryItem.Imei))
                    {
                        cleanImei = inventoryItem.Imei;
                    }
                }

                // 3. Thời hạn bảo hành: ưu tiên request, rồi orderItem.WarrantyMonths (mặc định 24T)
                int warrantyMonths = request.WarrantyMonths.GetValueOrDefault(
                    orderItem.WarrantyMonths > 0 ? orderItem.WarrantyMonths : 24);

                var orderItemSerial = new OrderItemSerial
                {
                    Id = Guid.NewGuid(),
                    OrderItemId = orderItem.Id,
                    InventoryItemId = inventoryItem?.Id,
                    SerialNumber = cleanSerial,
                    Imei = cleanImei,
                    WarrantyMonths = warrantyMonths,
                    WarrantyStatus = "Inactive", // Sẽ kích hoạt bằng nút "Kích hoạt e-Warranty" độc lập
                    ActivatedAt = null,
                    WarrantyExpiresAt = null
                };

                await _unitOfWork.BaseRepository<OrderItemSerial>().AddAsync(orderItemSerial, cancellationToken);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Assigned serial {SerialNumber} to OrderItem {OrderItemId} in Order {OrderId}",
                    "AssignOrderItemSerials",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", request.OrderId },
                        { "OrderItemId", request.OrderItemId },
                        { "SerialNumber", cleanSerial }
                    });

                var dto = _mapper.Map<OrderItemSerialDto>(orderItemSerial);
                return Result<OrderItemSerialDto>.Success(dto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi gán mã Serial/IMEI cho OrderItem");
                return Result<OrderItemSerialDto>.BadRequest($"Không thể gán mã Serial/IMEI: {ex.Message}");
            }
        }
    }
}
