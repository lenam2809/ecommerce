using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetTopSellingProducts
{
    public class GetTopSellingProductsQueryHandler : IRequestHandler<GetTopSellingProductsQuery, Result<List<TopProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public GetTopSellingProductsQueryHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<TopProductDto>>> Handle(GetTopSellingProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Calculate the start date (30 days ago)
                var startDate = DateTime.Today.AddDays(-30);

                // Get successful orders from the last 30 days
                var successfulOrders = await _unitOfWork.Orders
                    .FilterAsync(o => o.Status == Domain.Enums.EOrderStatus.Completed && o.CreatedAt >= startDate, cancellationToken: cancellationToken);

                var successfulOrderIds = successfulOrders
                    .Select(o => o.Id)
                    .ToList();

                if (successfulOrderIds.Count == 0)
                {
                    return Result<List<TopProductDto>>.Success([]);
                }

                // Get top selling products based on order items
                var topSellingProductsData = _unitOfWork.OrderItems
                    .FindAsync(oi => successfulOrderIds.Contains(oi.OrderId), cancellationToken).Result
                    .GroupBy(oi => oi.ProductId)
                    .Select(g => new
                    {
                        ProductId = g.Key,
                        QuantitySold = g.Sum(oi => oi.Quantity)
                    })
                    .OrderByDescending(x => x.QuantitySold)
                    .Take(request.Top)
                    .ToList(); // Fix: Use ToList() instead of ToListAsync() since the result is an IEnumerable.

                if (topSellingProductsData.Count == 0)
                {
                    return Result<List<TopProductDto>>.Success(new List<TopProductDto>());
                }

                // Get product details for the top selling products
                var productIds = topSellingProductsData.Select(p => p.ProductId).ToList();
                // Fix: Use `await` only on the asynchronous method, not on the result of `.Result`
                var products = (await _unitOfWork.Products
                    .FindAsync(p => productIds.Contains(p.Id), cancellationToken))
                    .ToList();

                // Map products to DTOs
                var topProductDtos = _mapper.Map<List<TopProductDto>>(products);

                // Add quantity sold to each DTO
                foreach (var dto in topProductDtos)
                {
                    var quantitySold = topSellingProductsData
                        .First(p => p.ProductId == dto.ProductId)
                        .QuantitySold;

                    dto.QuantitySold = quantitySold;

                    // Get file URL for the main image
                    if (!string.IsNullOrEmpty(dto.MainImage))
                    {
                        dto.MainImage = await _fileStorageService.GetFileUrlAsync(dto.MainImage);
                    }
                }

                // Sort by quantity sold (descending)
                topProductDtos = [.. topProductDtos.OrderByDescending(p => p.QuantitySold)];

                return Result<List<TopProductDto>>.Success(topProductDtos);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi lấy danh sách sản phẩm bán chạy");
                return Result<List<TopProductDto>>.BadRequest($"Lỗi khi lấy danh sách sản phẩm bán chạy: {ex.Message}");
            }
        }
    }
}

