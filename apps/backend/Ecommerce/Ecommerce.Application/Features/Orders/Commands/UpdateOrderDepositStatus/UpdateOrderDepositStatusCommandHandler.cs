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

namespace Ecommerce.Application.Features.Orders.Commands.UpdateOrderDepositStatus
{
    public class UpdateOrderDepositStatusCommandHandler : IRequestHandler<UpdateOrderDepositStatusCommand, Result<OrderDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public UpdateOrderDepositStatusCommandHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<OrderDto>> Handle(UpdateOrderDepositStatusCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var order = await _unitOfWork.Orders.GetQueryable()
                    .Include(o => o.OrderItems)
                        .ThenInclude(oi => oi.OrderItemSerials)
                    .Include(o => o.ApplicationUser)
                    .Include(o => o.Showroom)
                    .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

                if (order == null)
                    return Result<OrderDto>.NotFound($"Không tìm thấy đơn hàng với ID {request.OrderId}");

                // Cọc COD 10% áp dụng cho đơn COD > 20.000.000₫ (Chuẩn SSoT 2026)
                if (order.TotalAmount > 20_000_000m)
                {
                    order.DepositRequired = Math.Round(order.TotalAmount * 0.1m, 0);
                }

                order.DepositStatus = request.DepositStatus;

                if (request.DepositAmount.HasValue)
                {
                    order.DepositAmount = request.DepositAmount.Value;
                }
                else if (request.DepositStatus == EDepositStatus.Paid && order.DepositAmount == 0)
                {
                    order.DepositAmount = order.DepositRequired > 0 ? order.DepositRequired : Math.Round(order.TotalAmount * 0.1m, 0);
                }
                else if (request.DepositStatus == EDepositStatus.None)
                {
                    order.DepositAmount = 0;
                }

                order.RemainingAmount = Math.Max(0, order.TotalAmount - order.DepositAmount);

                // Cập nhật thông tin vận đơn nếu có
                if (request.CarrierName != null) order.CarrierName = request.CarrierName.Trim();
                if (request.TrackingNumber != null) order.TrackingNumber = request.TrackingNumber.Trim();
                if (request.DriverName != null) order.DriverName = request.DriverName.Trim();
                if (request.DriverPhone != null) order.DriverPhone = request.DriverPhone.Trim();

                _unitOfWork.Orders.Update(order);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Updated deposit status for Order {OrderId} to {DepositStatus}, DepositAmount: {DepositAmount}",
                    "UpdateOrderDepositStatus",
                    properties: new Dictionary<string, object?>
                    {
                        { "OrderId", order.Id },
                        { "DepositStatus", order.DepositStatus },
                        { "DepositAmount", order.DepositAmount }
                    });

                var dto = _mapper.Map<OrderDto>(order);
                return Result<OrderDto>.Success(dto);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi cập nhật trạng thái đặt cọc");
                return Result<OrderDto>.BadRequest($"Không thể cập nhật trạng thái đặt cọc: {ex.Message}");
            }
        }
    }
}
