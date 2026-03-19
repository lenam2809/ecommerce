using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrderAnalytics
{
    public class GetOrderAnalyticsQueryHandler : IRequestHandler<GetOrderAnalyticsQuery, Result<OrderAnalyticsDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;

        public GetOrderAnalyticsQueryHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<OrderAnalyticsDto>> Handle(GetOrderAnalyticsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddDays(-30);
                var endDate = request.EndDate ?? DateTime.Now;

                // Query orders within date range
                var orders = await _unitOfWork.Orders
                    .GetQueryable()
                    .Include(o => o.OrderItems)
                    .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                    .ToListAsync(cancellationToken);

                var analytics = new OrderAnalyticsDto
                {
                    TotalOrders = orders.Count,
                    TotalSales = orders.Sum(o => o.TotalAmount),
                    PendingOrders = orders.Count(o => o.Status == EOrderStatus.Pending),
                    ProcessingOrders = orders.Count(o => o.Status == EOrderStatus.Processing),
                    ShippedOrders = orders.Count(o => o.Status == EOrderStatus.Shipped),
                    DeliveredOrders = orders.Count(o => o.Status == EOrderStatus.Delivered),
                    CancelledOrders = orders.Count(o => o.Status == EOrderStatus.Cancelled),
                    ReturnedOrders = orders.Count(o => o.Status == EOrderStatus.Returned)
                };

                // Orders per day
                analytics.OrdersPerDay = orders
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new OrdersPerDayDto
                    {
                        Date = g.Key,
                        OrderCount = g.Count(),
                        TotalAmount = g.Sum(o => o.TotalAmount)
                    })
                    .OrderBy(o => o.Date)
                    .ToList();

                // Best selling products
                var allOrderItems = orders.SelectMany(o => o.OrderItems).ToList();
                analytics.BestSellingProducts = allOrderItems
                    .GroupBy(i => new { i.ProductId, i.Name, i.Image })
                    .Select(g => new BestSellingProductDto
                    {
                        ProductId = g.Key.ProductId,
                        Name = g.Key.Name,
                        Image = g.Key.Image,
                        TotalSold = g.Sum(i => i.Quantity),
                        TotalRevenue = g.Sum(i => i.UnitPrice * i.Quantity)
                    })
                    .OrderByDescending(p => p.TotalSold)
                    .Take(5)
                    .ToList();

                // Process image URLs
                foreach (var product in analytics.BestSellingProducts)
                {
                    if (!string.IsNullOrEmpty(product.Image))
                    {
                        product.Image = await _fileStorageService.GetFileUrlAsync(product.Image);
                    }
                }

                return Result<OrderAnalyticsDto>.Success(analytics);
            }
            catch (Exception ex)
            {
                return Result<OrderAnalyticsDto>.BadRequest(ex.Message);
            }
        }
    }
}

