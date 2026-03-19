using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetProductPerformance
{
    public class GetProductPerformanceQueryHandler : IRequestHandler<GetProductPerformanceQuery, Result<List<ProductPerformanceDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetProductPerformanceQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ProductPerformanceDto>>> Handle(GetProductPerformanceQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddYears(-1);
                var endDate = request.EndDate ?? DateTime.Now;

                var salesData = await GetSalesDataAsync(request, startDate, endDate, cancellationToken);
                var returnData = await GetReturnDataAsync(request, startDate, endDate, cancellationToken);
                var reviewData = await GetReviewDataAsync(request, startDate, endDate, cancellationToken);
                var stockData = await GetStockDataAsync(request, cancellationToken);

                var productPerformance = CombineData(salesData, returnData, reviewData, stockData, request.TopN ?? 20);

                return Result<List<ProductPerformanceDto>>.Success(productPerformance);
            }
            catch (Exception ex)
            {
                return Result<List<ProductPerformanceDto>>.BadRequest($"Lỗi khi lấy báo cáo hiệu suất sản phẩm: {ex.Message}");
            }
        }

        private async Task<List<SalesDataItem>> GetSalesDataAsync(GetProductPerformanceQuery request, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Orders.GetQueryable()
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Category)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status == Domain.Enums.EOrderStatus.Completed);

            if (request.ProductId.HasValue)
            {
                query = query.Where(o => o.OrderItems.Any(oi => oi.ProductId == request.ProductId.Value));
            }
            if (request.CategoryId.HasValue)
            {
                query = query.Where(o => o.OrderItems.Any(oi => oi.Product.CategoryId == request.CategoryId.Value));
            }

            return await query
                .SelectMany(o => o.OrderItems)
                .GroupBy(oi => new
                {
                    oi.ProductId,
                    oi.Product.Name,
                    oi.Product.Sku,
                    CategoryName = oi.Product.Category.Name
                })
                .Select(g => new SalesDataItem
                (
                    g.Key.ProductId,
                    g.Key.Name,
                    g.Key.Sku,
                    g.Key.CategoryName,
                    g.Sum(oi => oi.Quantity),
                    g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    g.Select(oi => oi.OrderId).Distinct().Count()
                ))
                .ToListAsync(cancellationToken);
        }

        private async Task<List<ReturnDataItem>> GetReturnDataAsync(GetProductPerformanceQuery request, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Orders.GetQueryable()
                .Include(r => r.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(r => r.Status == Domain.Enums.EOrderStatus.Returned && r.OrderDate >= startDate && r.OrderDate <= endDate);

            if (request.ProductId.HasValue)
            {
                query = query.Where(r => r.OrderItems.Any(o => o.ProductId == request.ProductId.Value));
            }
            if (request.CategoryId.HasValue)
            {
                query = query.Where(r => r.OrderItems.Any(o => o.Product != null && o.Product.CategoryId == request.CategoryId.Value));
            }

            return await query
                .SelectMany(r => r.OrderItems)
                .GroupBy(oi => oi.ProductId)
                .Select(g => new ReturnDataItem
                (
                    g.Key,
                    g.Sum(oi => oi.Quantity)
                ))
                .ToListAsync(cancellationToken);
        }

        private async Task<List<ReviewDataItem>> GetReviewDataAsync(GetProductPerformanceQuery request, DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Reviews.GetQueryable()
                .Include(r => r.Product)
                .Where(r => r.Date >= startDate && r.Date <= endDate);

            if (request.ProductId.HasValue)
            {
                query = query.Where(r => r.ProductId == request.ProductId.Value);
            }
            if (request.CategoryId.HasValue)
            {
                query = query.Where(r => r.Product != null && r.Product.CategoryId == request.CategoryId.Value);
            }

            return await query
                .GroupBy(r => r.ProductId)
                .Select(g => new ReviewDataItem(g.Key, (decimal)g.Average(r => r.Rating), g.Count()))
                .ToListAsync(cancellationToken);
        }

        private async Task<List<StockDataItem>> GetStockDataAsync(GetProductPerformanceQuery request, CancellationToken cancellationToken)
        {
            var query = _unitOfWork.Products.GetQueryable();

            if (request.ProductId.HasValue)
            {
                query = query.Where(p => p.Id == request.ProductId.Value);
            }
            if (request.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == request.CategoryId.Value);
            }

            return await query
                .Select(p => new StockDataItem
                (
                    p.Id,
                    p.StockQuantity
                ))
                .ToListAsync(cancellationToken);
        }

        private List<ProductPerformanceDto> CombineData(
            List<SalesDataItem> salesData,
            List<ReturnDataItem> returnData,
            List<ReviewDataItem> reviewData,
            List<StockDataItem> stockData,
            int topN)
        {
            var result = salesData
                .GroupJoin(returnData,
                    s => s.ProductId,
                    r => r.ProductId,
                    (s, r) => new
                    {
                        s.ProductId,
                        s.Name,
                        s.Sku,
                        s.CategoryName,
                        s.QuantitySold,
                        s.Revenue,
                        s.TotalOrders,
                        ReturnCount = r.FirstOrDefault()?.ReturnCount ?? 0
                    })
                .GroupJoin(reviewData,
                    s => s.ProductId,
                    r => r.ProductId,
                    (s, r) => new
                    {
                        s.ProductId,
                        s.Name,
                        s.Sku,
                        s.CategoryName,
                        s.QuantitySold,
                        s.Revenue,
                        s.TotalOrders,
                        s.ReturnCount,
                        Rating = r.FirstOrDefault()?.AverageRating ?? 0,
                        ReviewCount = r.FirstOrDefault()?.ReviewCount ?? 0
                    })
                .GroupJoin(stockData,
                    s => s.ProductId,
                    p => p.ProductId,
                    (s, p) => new ProductPerformanceDto
                    {
                        ProductId = s.ProductId,
                        Name = s.Name,
                        Sku = s.Sku,
                        CategoryName = s.CategoryName,
                        QuantitySold = s.QuantitySold,
                        Revenue = s.Revenue,
                        TotalOrders = s.TotalOrders,
                        ReturnRate = s.QuantitySold > 0 ? Math.Round((s.ReturnCount / (decimal)s.QuantitySold) * 100, 2) : 0,
                        CurrentStock = p.FirstOrDefault()?.CurrentStock ?? 0,
                        Rating = (decimal)s.Rating,
                        ReviewCount = s.ReviewCount
                    })
                .OrderByDescending(p => p.Revenue)
                .Take(topN)
                .ToList();

            return result;
        }

        private record SalesDataItem(
            Guid ProductId,
            string Name,
            string Sku,
            string CategoryName,
            int QuantitySold,
            decimal Revenue,
            int TotalOrders);


        private record ReturnDataItem(
            Guid ProductId,
            int ReturnCount);

        private record ReviewDataItem(
            Guid ProductId,
            decimal AverageRating,
            int ReviewCount);

        private record StockDataItem(
            Guid ProductId,
            int CurrentStock);


    }
}

