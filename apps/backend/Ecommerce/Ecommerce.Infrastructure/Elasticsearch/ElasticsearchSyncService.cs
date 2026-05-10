using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    public class ElasticsearchSyncService : IElasticsearchSyncService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductSearchService _productSearchService;
        private readonly ILogger<ElasticsearchSyncService> _logger;

        public ElasticsearchSyncService(
            IUnitOfWork unitOfWork,
            IProductSearchService productSearchService,
            ILogger<ElasticsearchSyncService> logger)
        {
            _unitOfWork = unitOfWork;
            _productSearchService = productSearchService;
            _logger = logger;
        }

        public async Task ReindexAllAsync(CancellationToken cancellationToken = default)
        {
            var products = await _unitOfWork.Products
                .GetQueryable()
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Specifications)
                .Include(p => p.Attributes)
                    .ThenInclude(a => a.Values)
                .Where(p => p.IsActive)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            if (products.Count == 0)
            {
                _logger.LogInformation("No active products found for Elasticsearch reindex.");
                return;
            }

            var documents = products.Select(p => new ProductSearchResultDto
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

            const int batchSize = 500;
            var totalBatches = (int)Math.Ceiling((double)documents.Count / batchSize);

            for (var i = 0; i < totalBatches; i++)
            {
                var batch = documents.Skip(i * batchSize).Take(batchSize);
                await _productSearchService.BulkIndexAsync(batch, cancellationToken);
                _logger.LogInformation("Elasticsearch reindex batch {Batch}/{Total} completed.", i + 1, totalBatches);
            }

            _logger.LogInformation("Elasticsearch reindex completed: {Count} products indexed.", documents.Count);
        }
    }
}
