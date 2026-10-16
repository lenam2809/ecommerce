using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    /// <summary>
    /// Fallback implementation of IProductSearchService used when Elasticsearch is disabled.
    /// Executes search and suggestion queries directly against the database using SQL LIKE / ILIKE.
    /// Indexing operations are safely treated as no-ops.
    /// </summary>
    public class NoOpProductSearchService : IProductSearchService
    {
        private readonly IUnitOfWork? _unitOfWork;
        private readonly ILogger<NoOpProductSearchService>? _logger;

        public NoOpProductSearchService(
            IUnitOfWork unitOfWork,
            ILogger<NoOpProductSearchService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public NoOpProductSearchService()
        {
        }

        public async Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
            string? keyword,
            Guid? categoryId,
            Guid? brandId,
            decimal? minPrice,
            decimal? maxPrice,
            int pageNumber,
            int pageSize,
            string? sortBy = null,
            bool isDescending = false,
            CancellationToken cancellationToken = default)
        {
            if (_unitOfWork == null)
            {
                return (new List<ProductSearchResultDto>(), 0L);
            }

            try
            {
                var query = _unitOfWork.Products.GetQueryable()
                    .AsNoTracking()
                    .Where(p => p.IsActive);

                if (!string.IsNullOrWhiteSpace(keyword))
                {
                    var trimmed = keyword.Trim();
                    var terms = trimmed.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                    foreach (var term in terms)
                    {
                        var pattern = term;
                        var lowerPattern = term.ToLower();
                        query = query.Where(p =>
                            p.Name.Contains(pattern) ||
                            p.Name.ToLower().Contains(lowerPattern) ||
                            EF.Functions.Like(p.Name, $"%{pattern}%") ||
                            (p.Description != null && (p.Description.Contains(pattern) || p.Description.ToLower().Contains(lowerPattern))) ||
                            p.Sku.Contains(pattern) ||
                            p.Code.Contains(pattern));
                    }
                }

                if (categoryId.HasValue && categoryId.Value != Guid.Empty)
                {
                    query = query.Where(p => p.CategoryId == categoryId.Value);
                }

                if (brandId.HasValue && brandId.Value != Guid.Empty)
                {
                    query = query.Where(p => p.BrandId == brandId.Value);
                }

                if (minPrice.HasValue)
                {
                    query = query.Where(p => (p.SalePrice ?? p.Price) >= minPrice.Value);
                }

                if (maxPrice.HasValue)
                {
                    query = query.Where(p => (p.SalePrice ?? p.Price) <= maxPrice.Value);
                }

                var totalCount = await query.CountAsync(cancellationToken);

                query = ApplySorting(query, sortBy, isDescending);

                var page = pageNumber < 1 ? 1 : pageNumber;
                var size = pageSize < 1 ? 10 : pageSize;
                var skip = (page - 1) * size;

                var items = await query
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .Skip(skip)
                    .Take(size)
                    .Select(p => new ProductSearchResultDto
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
                        CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                        CategorySlug = p.Category != null ? p.Category.Slug : string.Empty,
                        BrandId = p.BrandId,
                        BrandName = p.Brand != null ? p.Brand.Name : string.Empty,
                        BrandSlug = p.Brand != null ? p.Brand.Slug : string.Empty,
                        CreatedAt = p.CreatedAt,
                        Tags = new List<string>()
                    })
                    .ToListAsync(cancellationToken);

                return (items, totalCount);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while performing database fallback search for keyword: {Keyword}", keyword);
                throw;
            }
        }

        public async Task<List<ProductSuggestionDto>> GetSuggestionsAsync(
            string query,
            int limit = 5,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query) || _unitOfWork == null)
            {
                return new List<ProductSuggestionDto>();
            }

            try
            {
                var lower = query.Trim().ToLower();
                var limitCount = limit > 0 ? limit : 5;

                return await _unitOfWork.Products.GetQueryable()
                    .AsNoTracking()
                    .Where(p => p.IsActive && p.Name.ToLower().Contains(lower))
                    .OrderBy(p => p.Name)
                    .Take(limitCount)
                    .Select(p => new ProductSuggestionDto
                    {
                        Id = p.Id,
                        Text = p.Name,
                        Slug = p.Slug,
                        CategoryName = p.Category != null ? p.Category.Name : null,
                        Price = p.SalePrice ?? p.Price,
                        Image = p.Image
                    })
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error while getting fallback suggestions for query: {Query}", query);
                return new List<ProductSuggestionDto>();
            }
        }

        public Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        private static IQueryable<Product> ApplySorting(
            IQueryable<Product> query,
            string? sortBy,
            bool isDescending)
        {
            return sortBy?.ToLowerInvariant() switch
            {
                "price_asc" => query.OrderBy(p => p.SalePrice ?? p.Price),
                "price_desc" => query.OrderByDescending(p => p.SalePrice ?? p.Price),
                "price" => isDescending
                    ? query.OrderByDescending(p => p.SalePrice ?? p.Price)
                    : query.OrderBy(p => p.SalePrice ?? p.Price),
                "rating" => isDescending
                    ? query.OrderByDescending(p => p.Rating)
                    : query.OrderBy(p => p.Rating),
                "createdat" or "newest" => isDescending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt),
                "relevance" => isDescending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.Name),
                _ => isDescending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name)
            };
        }
    }
}
