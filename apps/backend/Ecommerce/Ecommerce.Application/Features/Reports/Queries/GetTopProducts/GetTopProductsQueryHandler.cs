using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetTopProducts
{
    public class GetTopProductsQueryHandler : IRequestHandler<GetTopProductsQuery, Result<List<TopProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetTopProductsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<TopProductDto>>> Handle(GetTopProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddMonths(-3);
                var endDate = request.EndDate ?? DateTime.Now;

                var query = _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        q => q.Include(o => o.OrderItems)
                            .ThenInclude(oi => oi.Product)
                            .ThenInclude(p => p.Category)
                        .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                               && o.Status == Domain.Enums.EOrderStatus.Completed),
                        cancellationToken);

                var orders = await query;

                var productStats = orders
                    .SelectMany(o => o.OrderItems)
                    .Where(oi => !request.CategoryId.HasValue || oi.Product.CategoryId == request.CategoryId)
                    .GroupBy(oi => new
                    {
                        ProductId = oi.ProductId,
                        Name = oi.Product.Name,
                        Sku = oi.Product.Sku
                    })
                    .Select(g => new TopProductDto
                    {
                        ProductId = g.Key.ProductId,
                        Name = g.Key.Name,
                        SKU = g.Key.Sku,
                        Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                        TotalQuantitySold = g.Sum(oi => oi.Quantity),
                        TotalOrders = g.Select(oi => oi.OrderId).Distinct().Count(),
                        AverageOrderValue = g.Average(oi => oi.Quantity * oi.UnitPrice)
                    });

                // Sắp xếp theo tiêu chí
                var results = request.OrderBy?.ToLower() switch
                {
                    "quantity" => productStats.OrderByDescending(p => p.TotalQuantitySold),
                    "orders" => productStats.OrderByDescending(p => p.TotalOrders),
                    _ => productStats.OrderByDescending(p => p.Revenue)
                };

                var finalResults = results.Take(request.TopN ?? 10).ToList();

                return Result<List<TopProductDto>>.Success(finalResults);
            }
            catch (Exception ex)
            {
                return Result<List<TopProductDto>>.BadRequest($"Lỗi khi lấy danh sách sản phẩm bán chạy: {ex.Message}");
            }
        }
    }
}

