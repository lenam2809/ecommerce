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

namespace Ecommerce.Application.Features.Orders.Commands.ActivateOrderWarranty
{
    public class ActivateOrderWarrantyCommandHandler : IRequestHandler<ActivateOrderWarrantyCommand, Result<List<OrderItemSerialDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public ActivateOrderWarrantyCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<List<OrderItemSerialDto>>> Handle(ActivateOrderWarrantyCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await _unitOfWork.Orders.GetQueryable()
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.OrderItemSerials)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                    return Result<List<OrderItemSerialDto>>.NotFound($"Không tìm thấy đơn hàng với ID {request.OrderId}");

                var itemsToActivate = request.OrderItemId.HasValue
                    ? order.OrderItems.Where(oi => oi.Id == request.OrderItemId.Value).ToList()
                    : order.OrderItems.ToList();

                if (!itemsToActivate.Any())
                    return Result<List<OrderItemSerialDto>>.NotFound("Không tìm thấy mục hàng nào cần kích hoạt bảo hành");

                var now = DateTime.UtcNow;
                var activatedSerials = new List<OrderItemSerial>();

                foreach (var item in itemsToActivate)
                {
                    foreach (var serial in item.OrderItemSerials)
                    {
                        serial.ActivatedAt = now;
                        var months = serial.WarrantyMonths > 0 ? serial.WarrantyMonths : (item.WarrantyMonths > 0 ? item.WarrantyMonths : 24);
                        serial.WarrantyMonths = months;
                        serial.WarrantyExpiresAt = now.AddMonths(months);
                        serial.WarrantyStatus = "Active";

                        // Nếu có InventoryItem liên kết, cập nhật ngày bảo hành và Sold
                        if (serial.InventoryItemId.HasValue)
                        {
                            var inv = await _unitOfWork.InventoryItems.GetByIdAsync(serial.InventoryItemId.Value, cancellationToken);
                            if (inv != null)
                            {
                                inv.WarrantyMonths = months;
                                inv.WarrantyExpiresAt = serial.WarrantyExpiresAt;
                                if (inv.Status == EInventoryStatus.Reserved)
                                {
                                    inv.ConfirmSold();
                                }
                            }
                        }

                        activatedSerials.Add(serial);
                    }
                }

                if (!activatedSerials.Any())
                {
                    return Result<List<OrderItemSerialDto>>.BadRequest("Chưa có mã Serial/IMEI nào được gán để kích hoạt bảo hành.");
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Activated e-Warranty for {Count} serials in Order {OrderId}",
                    "ActivateOrderWarranty",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", request.OrderId },
                        { "SerialCount", activatedSerials.Count }
                    });

                var dtos = _mapper.Map<List<OrderItemSerialDto>>(activatedSerials);
                return Result<List<OrderItemSerialDto>>.Success(dtos);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi kích hoạt bảo hành điện tử");
                return Result<List<OrderItemSerialDto>>.BadRequest($"Không thể kích hoạt bảo hành điện tử: {ex.Message}");
            }
        }
    }
}
