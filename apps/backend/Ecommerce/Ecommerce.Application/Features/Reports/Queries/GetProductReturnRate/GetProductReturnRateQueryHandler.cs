using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductReturnRate
{
    public class GetProductReturnRateQueryHandler : IRequestHandler<GetProductReturnRateQuery, Result<List<ProductReturnRateDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetProductReturnRateQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ProductReturnRateDto>>> Handle(GetProductReturnRateQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddMonths(-6);
                var endDate = request.EndDate ?? DateTime.Now;

                // Lấy dữ liệu đơn hàng đã hoàn thành
                var completedOrders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(o => o.OrderItems)
                                .ThenInclude(oi => oi.Product)
                                    .ThenInclude(p => p.Category)
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                                   && o.Status == Domain.Enums.EOrderStatus.Completed),
                        cancellationToken);

                // Lấy dữ liệu đơn hàng bị trả (giả sử có enum status cho returned)
                var returnedOrders = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(o => o.OrderItems)
                                .ThenInclude(oi => oi.Product)
                                    .ThenInclude(p => p.Category)
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate
                                   && o.Status == Domain.Enums.EOrderStatus.Returned),
                        cancellationToken);

                var productSales = completedOrders
                    .SelectMany(o => o.OrderItems)
                    .Where(oi => !request.CategoryId.HasValue || oi.Product.CategoryId == request.CategoryId)
                    .GroupBy(oi => new
                    {
                        ProductId = oi.ProductId,
                        Name = oi.Product.Name,
                        Sku = oi.Product.Sku,
                        CategoryName = oi.Product.Category.Name
                    })
                    .ToDictionary(g => g.Key.ProductId, g => new
                    {
                        Key = g.Key,
                        TotalSold = g.Sum(oi => oi.Quantity),
                        Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                    });

                var productReturns = returnedOrders
                    .SelectMany(o => o.OrderItems)
                    .GroupBy(oi => oi.ProductId)
                    .ToDictionary(g => g.Key, g => g.Sum(oi => oi.Quantity));

                var results = productSales.Values
                    .Select(sale => new ProductReturnRateDto
                    {
                        ProductId = sale.Key.ProductId,
                        Name = sale.Key.Name,
                        SKU = sale.Key.Sku,
                        CategoryName = sale.Key.CategoryName,
                        TotalSold = sale.TotalSold,
                        TotalReturned = productReturns.GetValueOrDefault(sale.Key.ProductId, 0),
                        Revenue = sale.Revenue,
                        ReturnRate = sale.TotalSold > 0 ?
                            Math.Round((decimal)productReturns.GetValueOrDefault(sale.Key.ProductId, 0) / sale.TotalSold * 100, 2) : 0
                    })
                    .Where(p => !request.MinReturnRate.HasValue || p.ReturnRate >= request.MinReturnRate)
                    .OrderByDescending(p => p.ReturnRate)
                    .Take(request.TopN ?? 10)
                    .ToList();

                return Result<List<ProductReturnRateDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<ProductReturnRateDto>>.BadRequest($"Lỗi khi lấy tỷ lệ trả hàng: {ex.Message}");
            }
        }
    }
}

