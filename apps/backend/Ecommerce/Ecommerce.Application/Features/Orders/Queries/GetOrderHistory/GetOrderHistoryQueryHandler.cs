using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using System.Text.Json;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderHistory
{
    public class GetOrderHistoryQueryHandler : IRequestHandler<GetOrderHistoryQuery, Result<List<OrderHistoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetOrderHistoryQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<OrderHistoryDto>>> Handle(GetOrderHistoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Kiểm tra xem order có tồn tại không
                var order = await _unitOfWork.Orders.GetByIdAsync(request.OrderId, cancellationToken);
                if (order == null)
                {
                    return Result<List<OrderHistoryDto>>.NotFound($"Không tìm thấy đơn hàng với ID {request.OrderId}");
                }

                var histories = await _unitOfWork.OrderHistories.GetOrderHistoryWithPaginationAsync(
                    request.OrderId,
                    request.PageNumber,
                    request.PageSize,
                    cancellationToken);

                var historyDtos = histories.Select(h => new OrderHistoryDto
                {
                    Id = h.Id,
                    OrderId = h.OrderId,
                    FromStatus = h.FromStatus.ToString(),
                    ToStatus = h.ToStatus.ToString(),
                    Notes = h.Notes,
                    ChangedBy = h.ChangedBy,
                    ChangeSource = h.ChangeSource,
                    ChangedAt = h.ChangedAt,
                    PreviousTotalAmount = h.PreviousTotalAmount,
                    NewTotalAmount = h.NewTotalAmount,
                    PreviousShippingAddress = h.PreviousShippingAddress,
                    NewShippingAddress = h.NewShippingAddress,
                    PreviousExpectedDeliveryDate = h.PreviousExpectedDeliveryDate,
                    NewExpectedDeliveryDate = h.NewExpectedDeliveryDate,
                    PreviousDiscountCode = h.PreviousDiscountCode,
                    NewDiscountCode = h.NewDiscountCode,
                    AdditionalData = !string.IsNullOrEmpty(h.AdditionalData)
                        ? JsonSerializer.Deserialize<Dictionary<string, object>>(h.AdditionalData)
                        : null
                }).ToList();

                return Result<List<OrderHistoryDto>>.Success(historyDtos);
            }
            catch (Exception ex)
            {
                return Result<List<OrderHistoryDto>>.BadRequest($"Lỗi khi lấy lịch sử đơn hàng: {ex.Message}");
            }
        }
    }
}

