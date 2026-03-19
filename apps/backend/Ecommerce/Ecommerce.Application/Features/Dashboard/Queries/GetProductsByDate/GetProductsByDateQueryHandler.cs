using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetProductsByDate
{
    public class GetProductsByDateQueryHandler : IRequestHandler<GetProductsByDateQuery, Result<List<ProductsByDateDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public GetProductsByDateQueryHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<List<ProductsByDateDto>>> Handle(GetProductsByDateQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = DateTime.Today;
                var startDate = endDate.AddDays(-request.Days);

                var query = _unitOfWork.Orders.GetQueryable();

                var ordersData = await query
                    .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new ProductsByDateDto
                    {
                        Date = DateOnly.FromDateTime(g.Key),
                        NewProducts = g.Count()
                    })
                    .OrderBy(d => d.Date)
                    .ToListAsync(cancellationToken);

                return Result<List<ProductsByDateDto>>.Success(ordersData);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi lấy dữ liệu sản phẩm theo ngày");
                return Result<List<ProductsByDateDto>>.BadRequest($"Lỗi khi lấy dữ liệu đơn hàng: {ex.Message}");
            }
        }
    }
}

