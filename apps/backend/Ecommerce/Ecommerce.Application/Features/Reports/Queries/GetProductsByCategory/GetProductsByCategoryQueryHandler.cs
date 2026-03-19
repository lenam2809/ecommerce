using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductsByCategory
{
    public class GetProductsByCategoryQueryHandler : IRequestHandler<GetProductsByCategoryQuery, Result<List<ProductsByCategoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetProductsByCategoryQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ProductsByCategoryDto>>> Handle(GetProductsByCategoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddMonths(-12);
                var endDate = request.EndDate ?? DateTime.Now;

                // Lấy dữ liệu sản phẩm theo category
                var categories = await _unitOfWork.Categories
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(c => c.Products)
                            .Where(c => c.IsActive || request.IncludeInactive == true),
                        cancellationToken);

                // Lấy dữ liệu bán hàng
                var orderItems = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(o => o.OrderItems)
                                .ThenInclude(oi => oi.Product)
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                                   && o.Status == Domain.Enums.EOrderStatus.Completed),
                        cancellationToken);

                var salesData = orderItems
                    .SelectMany(o => o.OrderItems)
                    .GroupBy(oi => oi.Product.CategoryId)
                    .ToDictionary(g => g.Key, g => new
                    {
                        TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                        TotalQuantity = g.Sum(oi => oi.Quantity)
                    });

                var results = categories
                    .Where(c => salesData.Select(s => s.Key).Contains(c.Id))
                    .Select(c => new ProductsByCategoryDto
                    {
                        CategoryId = c.Id,
                        Name = c.Name,
                        ProductCount = c.Products.Count,
                        TotalRevenue = salesData.GetValueOrDefault(c.Id)?.TotalRevenue ?? 0,
                        TotalQuantitySold = salesData.GetValueOrDefault(c.Id)?.TotalQuantity ?? 0,
                        AverageProductPrice = c.Products.Any() ? c.Products.Average(p => p.Price) : 0
                    })
                    .OrderByDescending(c => c.TotalRevenue)
                    .ToList();

                // Tính phần trăm
                var totalRevenue = results.Sum(r => r.TotalRevenue);
                if (totalRevenue > 0)
                {
                    foreach (var item in results)
                    {
                        item.Percentage = Math.Round((item.TotalRevenue / totalRevenue) * 100, 2);
                    }
                }

                return Result<List<ProductsByCategoryDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<ProductsByCategoryDto>>.BadRequest($"Lỗi khi lấy báo cáo sản phẩm theo danh mục: {ex.Message}");
            }
        }
    }
}

