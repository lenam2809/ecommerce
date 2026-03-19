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
                var startDate = request.StartDate ?? DateTime.Now.AddYears(-1);
                var endDate = request.EndDate ?? DateTime.Now;

                // Truy vấn doanh thu theo danh mục từ các đơn hàng
                var categoryRevenues = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(o => o.OrderItems)
                                .ThenInclude(oi => oi.Product)
                                    .ThenInclude(p => p.Category)
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                                   && o.Status == Domain.Enums.EOrderStatus.Completed),
                        cancellationToken)
                    .ContinueWith(task => task.Result
                        .SelectMany(o => o.OrderItems)
                        .GroupBy(oi => new
                        {
                            CategoryId = oi.Product.CategoryId,
                            CategoryName = oi.Product.Category.Name
                        })
                        .Select(g => new RevenueByCategoryDto
                        {
                            Name = g.Key.CategoryName,
                            Value = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                        })
                        .OrderByDescending(r => r.Value)
                        .Take(request.TopN ?? 10)
                        .ToList(),
                        cancellationToken);

                var results = categoryRevenues;

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

