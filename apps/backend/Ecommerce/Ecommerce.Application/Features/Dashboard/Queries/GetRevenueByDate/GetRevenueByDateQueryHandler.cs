using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetRevenueByDate
{
    //[Authorize(Policy = "Dashboard:View")]
    public class GetRevenueByDateQueryHandler : IRequestHandler<GetRevenueByDateQuery, Result<List<RevenueByDateDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public GetRevenueByDateQueryHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<List<RevenueByDateDto>>> Handle(GetRevenueByDateQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = DateTime.Today;
                var startDate = endDate.AddDays(-request.Days);

                var query = _unitOfWork.Orders.GetQueryable();

                var revenueData = await query.Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate && o.Status == EOrderStatus.Completed)
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new RevenueByDateDto
                    {
                        Date = DateOnly.FromDateTime(g.Key),
                        Revenue = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(d => d.Date)
                    .ToListAsync(cancellationToken);

                return Result<List<RevenueByDateDto>>.Success(revenueData);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi lấy dữ liệu doanh thu theo ngày");
                return Result<List<RevenueByDateDto>>.BadRequest($"Lỗi khi lấy dữ liệu doanh thu: {ex.Message}");
            }
        }
    }
}

