using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    /// <summary>
    /// Background service chạy initial reindex khi khởi động và full reindex hằng ngày.
    /// </summary>
    public class ElasticsearchInitialSyncService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<ElasticsearchInitialSyncService> _logger;
        private readonly ElasticsearchOptions _options;

        public ElasticsearchInitialSyncService(
            IServiceScopeFactory scopeFactory,
            ILogger<ElasticsearchInitialSyncService> logger,
            IOptions<ElasticsearchOptions> options)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _options = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_options.RunStartupReindex)
            {
                await TryReindexAsync(skipWhenIndexHasData: true, stoppingToken);
            }

            if (!_options.RunDailyReindex)
            {
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                var delay = GetDelayUntilNextRun();
                _logger.LogInformation("Elasticsearch daily sync scheduled in {Delay}", delay);
                await Task.Delay(delay, stoppingToken);
                await TryReindexAsync(skipWhenIndexHasData: false, stoppingToken);
            }
        }

        private async Task TryReindexAsync(bool skipWhenIndexHasData, CancellationToken cancellationToken)
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

                if (skipWhenIndexHasData && existingCount > 0)
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
                    .Include(p => p.Specifications)
                    .Include(p => p.Attributes)
                        .ThenInclude(a => a.Values)
                    .Where(p => p.IsActive)
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
                    MainImage = p.Image,
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
                    CreatedAt = p.CreatedAt,
                    Tags = p.Specifications
                        .SelectMany(s => new[] { s.Name, s.Value })
                        .Concat(p.Attributes.Select(a => a.Name))
                        .Concat(p.Attributes.SelectMany(a => a.Values.Select(v => v.Value)))
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList()
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

        private TimeSpan GetDelayUntilNextRun()
        {
            var now = DateTimeOffset.UtcNow;
            var hour = Math.Clamp(_options.DailyReindexHourUtc, 0, 23);
            var next = new DateTimeOffset(now.Year, now.Month, now.Day, hour, 0, 0, TimeSpan.Zero);

            if (next <= now)
            {
                next = next.AddDays(1);
            }

            return next - now;
        }
    }
}
