using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    /// <summary>
    /// HostedService chạy khi ứng dụng khởi động.
    /// Nếu index Elasticsearch rỗng → bulk index toàn bộ Product từ SQL Server.
    /// </summary>
    public class ElasticsearchInitialSyncService : IHostedService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ElasticsearchInitialSyncService> _logger;

        public ElasticsearchInitialSyncService(
            IServiceScopeFactory scopeFactory,
            ILogger<ElasticsearchInitialSyncService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Elasticsearch Initial Sync: Bắt đầu kiểm tra và đồng bộ dữ liệu...");

            try
            {
                // Delay nhỏ để đợi Elasticsearch sẵn sàng
                await Task.Delay(TimeSpan.FromSeconds(3), cancellationToken);

                using var scope = _scopeFactory.CreateScope();
                var searchService = scope.ServiceProvider.GetRequiredService<IProductSearchService>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                // Thử search để kiểm tra xem index đã có data chưa
                var (existingItems, existingCount) = await searchService.SearchProductsAsync(
                    keyword: null,
                    categoryId: null,
                    brandId: null,
                    minPrice: null,
                    maxPrice: null,
                    pageNumber: 1,
                    pageSize: 1,
                    cancellationToken: cancellationToken);

                if (existingCount > 0)
                {
                    _logger.LogInformation(
                        "Elasticsearch đã có {Count} documents. Bỏ qua initial sync.", existingCount);
                    return;
                }

                // Lấy toàn bộ Product từ SQL Server
                _logger.LogInformation("Elasticsearch index rỗng. Bắt đầu bulk index từ SQL Server...");

                var products = await unitOfWork.Products
                    .GetQueryable()
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                if (!products.Any())
                {
                    _logger.LogInformation("Không có product nào trong SQL Server để sync.");
                    return;
                }

                // Map sang DTO
                var dtos = products.Select(p => new ProductSearchResultDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Sku = p.Sku,
                    Slug = p.Slug,
                    Price = p.Price,
                    SalePrice = p.SalePrice,
                    Image = p.Image,
                    Description = p.Description,
                    StockQuantity = p.StockQuantity,
                    Rating = p.Rating,
                    ReviewCount = p.ReviewCount,
                    IsActive = p.IsActive,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category?.Name ?? string.Empty,
                    CategorySlug = p.Category?.Slug ?? string.Empty,
                    BrandId = p.BrandId,
                    BrandName = p.Brand?.Name ?? string.Empty,
                    BrandSlug = p.Brand?.Slug ?? string.Empty,
                    CreatedAt = p.CreatedAt
                }).ToList();

                // Bulk index theo batch 500 records
                const int batchSize = 500;
                var totalBatches = (int)Math.Ceiling((double)dtos.Count / batchSize);

                for (int i = 0; i < totalBatches; i++)
                {
                    var batch = dtos.Skip(i * batchSize).Take(batchSize);
                    await searchService.BulkIndexAsync(batch, cancellationToken);
                    _logger.LogInformation("Bulk index batch {Batch}/{Total} hoàn thành", i + 1, totalBatches);
                }

                _logger.LogInformation(
                    "Elasticsearch Initial Sync hoàn thành: {Count} products đã được index.", dtos.Count);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Elasticsearch Initial Sync thất bại. Hệ thống vẫn hoạt động bình thường với SQL search. " +
                    "Elasticsearch sync sẽ được thử lại khi có Product mới được tạo/cập nhật.");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Elasticsearch Initial Sync Service đã dừng.");
            return Task.CompletedTask;
        }
    }
}
