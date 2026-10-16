using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRevenueByCategory
{
    public class GetRevenueByCategoryQueryHandler : IRequestHandler<GetRevenueByCategoryQuery, Result<List<RevenueByCategoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRevenueByCategoryQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RevenueByCategoryDto>>> Handle(GetRevenueByCategoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Thiết lập thời gian mặc định nếu không có
                var startDate = request.StartDate ?? DateTime.UtcNow.AddYears(-1);
                var endDate = request.EndDate ?? DateTime.UtcNow;

                // Truy vấn doanh thu theo danh mục với projection tinh gọn, tránh tải toàn bộ entity graph vào RAM
                var rawItems = await _unitOfWork.Orders.GetQueryable()
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                           && o.Status == Domain.Enums.EOrderStatus.Completed)
                    .SelectMany(o => o.OrderItems)
                    .Where(oi => oi.Product != null && oi.Product.Category != null)
                    .Select(oi => new
                    {
                        CategoryName = oi.Product.Category.Name,
                        Amount = oi.Quantity * oi.UnitPrice
                    })
                    .ToListAsync(cancellationToken);

                var results = rawItems
                    .GroupBy(x => x.CategoryName)
                    .Select(g => new RevenueByCategoryDto
                    {
                        Name = g.Key,
                        Value = g.Sum(x => x.Amount)
                    })
                    .OrderByDescending(r => r.Value)
                    .Take(request.TopN ?? 10)
                    .ToList();

                // Tính phần trăm
                var totalRevenue = results.Sum(r => r.Value);
                if (totalRevenue > 0)
                {
                    foreach (var item in results)
                    {
                        item.Percentage = Math.Round((item.Value / totalRevenue) * 100, 2);
                    }
                }

                return Result<List<RevenueByCategoryDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<RevenueByCategoryDto>>.BadRequest($"Lỗi khi lấy báo cáo doanh thu theo danh mục: {ex.Message}");
            }
        }
    }
}

