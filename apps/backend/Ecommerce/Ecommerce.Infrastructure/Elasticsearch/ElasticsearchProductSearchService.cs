using Elastic.Clients.Elasticsearch;
using Elastic.Clients.Elasticsearch.Core.Search;
using Elastic.Clients.Elasticsearch.QueryDsl;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Exceptions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Infrastructure.Elasticsearch.Documents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Elasticsearch
{
    /// <summary>
    /// Implementation của IProductSearchService sử dụng Elasticsearch Client 8.x.
    /// Hỗ trợ full-text search, fuzzy matching, completion suggester, và CRUD document.
    /// </summary>
    public class ElasticsearchProductSearchService : IProductSearchService
    {
        private readonly ElasticsearchClient _client;
        private readonly string _indexName;
        private readonly ILogger<ElasticsearchProductSearchService> _logger;

        public ElasticsearchProductSearchService(
            ElasticsearchClient client,
            IConfiguration configuration,
            ILogger<ElasticsearchProductSearchService> logger)
        {
            _client = client;
            var options = configuration.GetSection(ElasticsearchOptions.SectionName).Get<ElasticsearchOptions>()
                ?? new ElasticsearchOptions();
            _indexName = options.ResolvedIndexName;
            _logger = logger;
        }

        #region Search

        /// <summary>
        /// Full-text search: MultiMatch (Name^3, Description) + Fuzzy + Term filters + Range filter + Pagination.
        /// </summary>
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
            try
            {
                var from = (pageNumber - 1) * pageSize;

                var response = await _client.SearchAsync<ProductDocument>(s =>
                {
                    s.Index(_indexName)
                     .From(from)
                     .Size(pageSize);

                    // Xây dựng Bool query
                    s.Query(q => q
                        .Bool(b =>
                        {
                            // MUST: Full-text search với fuzzy
                            if (!string.IsNullOrWhiteSpace(keyword))
                            {
                                b.Must(m => m
                                    .MultiMatch(mm => mm
                                        .Query(keyword)
                                        .Fields(new[]
                                        {
                                            "name^3",
                                            "tags^2",
                                            "brandName^2",
                                            "categoryName^1.5",
                                            "description",
                                            "sku",
                                            "code"
                                        })
                                        .Fuzziness(new Fuzziness("AUTO"))
                                        .PrefixLength(1)
                                        .Type(TextQueryType.BestFields)
                                    )
                                );
                            }

                            // FILTER: Không ảnh hưởng scoring, tối ưu cache
                            var filters = new List<Action<QueryDescriptor<ProductDocument>>>();

                            // Chỉ lấy sản phẩm active
                            filters.Add(f => f.Term(t => t
                                .Field(p => p.IsActive)
                                .Value(true)
                            ));

                            if (categoryId.HasValue)
                            {
                                filters.Add(f => f.Term(t => t
                                    .Field(p => p.CategoryId)
                                    .Value(categoryId.Value.ToString())
                                ));
                            }

                            if (brandId.HasValue)
                            {
                                filters.Add(f => f.Term(t => t
                                    .Field(p => p.BrandId)
                                    .Value(brandId.Value.ToString())
                                ));
                            }

                            // Range filter cho giá (ưu tiên SalePrice nếu có, fallback Price)
                            if (minPrice.HasValue || maxPrice.HasValue)
                            {
                                filters.Add(f => f.Range(r => r
                                    .NumberRange(nr =>
                                    {
                                        nr.Field(p => p.Price);
                                        if (minPrice.HasValue) nr.Gte((double)minPrice.Value);
                                        if (maxPrice.HasValue) nr.Lte((double)maxPrice.Value);
                                    })
                                ));
                            }

                            b.Filter(filters.ToArray());
                        })
                    );

                    // Sắp xếp
                    ApplySorting(s, sortBy, isDescending, keyword);

                }, cancellationToken);

                if (!response.IsValidResponse)
                {
                    _logger.LogWarning("Elasticsearch search failed: {DebugInfo}", response.DebugInformation);
                    throw new SearchServiceUnavailableException("Elasticsearch search failed.");
                }

                var items = response.Documents.Select(MapToDto).ToList();
                var totalCount = response.Total;

                _logger.LogDebug("Elasticsearch search: keyword='{Keyword}', found {Total} results", keyword, totalCount);

                return (items, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi search Elasticsearch với keyword: {Keyword}", keyword);
                throw new SearchServiceUnavailableException("Elasticsearch is unavailable.", ex);
            }
        }

        #endregion

        #region Suggestions

        /// <summary>
        /// Auto-suggestion sử dụng Completion Suggester — trả kết quả siêu nhanh.
        /// </summary>
        public async Task<List<ProductSuggestionDto>> GetSuggestionsAsync(
            string query,
            int limit = 5,
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    return new List<ProductSuggestionDto>();

                var response = await _client.SearchAsync<ProductDocument>(s => s
                    .Index(_indexName)
                    .Size(0) // Không cần hits, chỉ cần suggest
                    .Suggest(sg => sg
                        .Suggesters(sug => sug
                            .Add("product-suggest", su => su
                                .Prefix(query)
                                .Completion(c => c
                                    .Field(p => p.Suggest)
                                    .Size(limit)
                                    .SkipDuplicates(true)
                                    .Fuzzy(f => f
                                        .Fuzziness(new Fuzziness("AUTO"))
                                        .MinLength(3)
                                        .PrefixLength(1)
                                    )
                                )
                            )
                        )
                    ),
                    cancellationToken);

                if (!response.IsValidResponse)
                {
                    _logger.LogWarning("Elasticsearch suggest failed: {DebugInfo}", response.DebugInformation);
                    return new List<ProductSuggestionDto>();
                }

                var suggestions = new List<ProductSuggestionDto>();

                if (response.Suggest != null &&
                    response.Suggest.TryGetValue("product-suggest", out var suggestResults))
                {
                    foreach (var suggest in suggestResults)
                    {
                        if (suggest is CompletionSuggest<ProductDocument> completionSuggest)
                        {
                            foreach (var option in completionSuggest.Options)
                            {
                                if (option.Source != null)
                                {
                                    suggestions.Add(new ProductSuggestionDto
                                    {
                                        Id = option.Source.Id,
                                        Text = option.Source.Name,
                                        Slug = option.Source.Slug,
                                        CategoryName = option.Source.CategoryName,
                                        Price = option.Source.Price,
                                        Image = option.Source.Image
                                    });
                                }
                            }
                        }
                    }
                }

                _logger.LogDebug("Elasticsearch suggest: query='{Query}', found {Count} suggestions", query, suggestions.Count);
                return suggestions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy suggestions từ Elasticsearch: {Query}", query);
                return new List<ProductSuggestionDto>();
            }
        }

        #endregion

        #region CRUD Document

        public async Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            try
            {
                var document = MapToDocument(product);
                var response = await _client.IndexAsync(document, i => i
                    .Index(_indexName)
                    .Id(product.Id.ToString()),
                    cancellationToken);

                if (!response.IsValidResponse)
                {
                    _logger.LogWarning("Không thể index product {ProductId}: {DebugInfo}",
                        product.Id, response.DebugInformation);
                }
                else
                {
                    _logger.LogInformation("Đã index product {ProductId} ({ProductName}) vào Elasticsearch",
                        product.Id, product.Name);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi index product {ProductId} vào Elasticsearch", product.Id);
            }
        }

        public async Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default)
        {
            // Elasticsearch upsert: Index sẽ tự tạo mới hoặc ghi đè document cùng Id
            await IndexProductAsync(product, cancellationToken);
        }

        public async Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default)
        {
            try
            {
                var response = await _client.DeleteAsync<ProductDocument>(
                    productId.ToString(),
                    d => d.Index(_indexName),
                    cancellationToken);

                if (!response.IsValidResponse)
                {
                    _logger.LogWarning("Không thể xóa product {ProductId} khỏi Elasticsearch: {DebugInfo}",
                        productId, response.DebugInformation);
                }
                else
                {
                    _logger.LogInformation("Đã xóa product {ProductId} khỏi Elasticsearch", productId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa product {ProductId} khỏi Elasticsearch", productId);
            }
        }

        public async Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default)
        {
            try
            {
                var documents = products.Select(MapToDocument).ToList();

                if (!documents.Any())
                {
                    _logger.LogInformation("Không có product nào để bulk index");
                    return;
                }

                var response = await _client.BulkAsync(b => b
                    .Index(_indexName)
                    .IndexMany(documents, (op, doc) => op.Id(doc.Id.ToString())),
                    cancellationToken);

                if (response.Errors)
                {
                    var errorItems = response.ItemsWithErrors.ToList();
                    _logger.LogWarning("Bulk index có {ErrorCount} lỗi trên tổng {Total} documents",
                        errorItems.Count, documents.Count);

                    foreach (var item in errorItems.Take(5))
                    {
                        _logger.LogWarning("  Bulk error: {Error}", item.Error?.Reason);
                    }
                }
                else
                {
                    _logger.LogInformation("Đã bulk index thành công {Count} products vào Elasticsearch", documents.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi bulk index products vào Elasticsearch");
            }
        }

        #endregion

        #region Private Helpers

        /// <summary>
        /// Map ProductDocument (Elasticsearch) → ProductSearchResultDto (Application).
        /// </summary>
        private static ProductSearchResultDto MapToDto(ProductDocument doc) => new()
        {
            Id = doc.Id,
            Code = doc.Code,
            Name = doc.Name,
            Sku = doc.Sku,
            Slug = doc.Slug,
            Price = doc.Price,
            SalePrice = doc.SalePrice,
            Image = doc.Image,
            MainImage = string.IsNullOrWhiteSpace(doc.MainImage) ? doc.Image : doc.MainImage,
            Description = doc.Description,
            StockQuantity = doc.StockQuantity,
            Rating = doc.Rating,
            ReviewCount = doc.ReviewCount,
            IsActive = doc.IsActive,
            CategoryId = doc.CategoryId,
            CategoryName = doc.CategoryName,
            CategorySlug = doc.CategorySlug,
            BrandId = doc.BrandId,
            BrandName = doc.BrandName,
            BrandSlug = doc.BrandSlug,
            CreatedAt = doc.CreatedAt,
            Tags = doc.Tags
        };

        /// <summary>
        /// Map ProductSearchResultDto → ProductDocument (kèm Completion Suggest data).
        /// </summary>
        private static ProductDocument MapToDocument(ProductSearchResultDto dto) => new()
        {
            Id = dto.Id,
            Code = dto.Code,
            Name = dto.Name,
            Sku = dto.Sku,
            Slug = dto.Slug,
            Price = dto.Price,
            SalePrice = dto.SalePrice,
            Image = dto.Image,
            MainImage = string.IsNullOrWhiteSpace(dto.MainImage) ? dto.Image : dto.MainImage,
            Description = dto.Description,
            StockQuantity = dto.StockQuantity,
            Rating = dto.Rating,
            ReviewCount = dto.ReviewCount,
            IsActive = dto.IsActive,
            CategoryId = dto.CategoryId,
            CategoryName = dto.CategoryName,
            CategorySlug = dto.CategorySlug,
            BrandId = dto.BrandId,
            BrandName = dto.BrandName,
            BrandSlug = dto.BrandSlug,
            CreatedAt = dto.CreatedAt,
            Tags = dto.Tags,
            // Tạo suggest input từ Name (gợi ý khi gõ)
            Suggest = new CompletionField
            {
                Input = GenerateSuggestInputs(dto.Name),
                Weight = (int)(dto.Rating * 100) // Ưu tiên sản phẩm rating cao
            }
        };

        /// <summary>
        /// Tạo danh sách input cho Completion Suggester từ tên sản phẩm.
        /// Ví dụ: "iPhone 15 Pro Max" → ["iPhone 15 Pro Max", "15 Pro Max", "Pro Max", "Max"]
        /// </summary>
        private static IEnumerable<string> GenerateSuggestInputs(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return new[] { string.Empty };

            var inputs = new List<string> { name };
            var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            // Thêm các suffix (bỏ từ đầu) để hỗ trợ search giữa tên
            for (int i = 1; i < words.Length && i < 4; i++)
            {
                inputs.Add(string.Join(' ', words.Skip(i)));
            }

            return inputs.Distinct();
        }

        /// <summary>
        /// Áp dụng sắp xếp. Nếu search keyword → mặc định sort theo relevance (_score).
        /// </summary>
        private static void ApplySorting(
            SearchRequestDescriptor<ProductDocument> s,
            string? sortBy,
            bool isDescending,
            string? keyword)
        {
            if (string.IsNullOrWhiteSpace(sortBy) && !string.IsNullOrWhiteSpace(keyword))
            {
                // Search có keyword → sort theo relevance (mặc định Elasticsearch)
                return;
            }

            var order = isDescending ? SortOrder.Desc : SortOrder.Asc;

            s.Sort(sort =>
            {
                switch (sortBy?.ToLowerInvariant())
                {
                    case "relevance":
                        if (!string.IsNullOrWhiteSpace(keyword))
                        {
                            sort.Score(new ScoreSort { Order = SortOrder.Desc });
                        }
                        break;
                    case "price_asc":
                        sort.Field(p => p.Price, f => f.Order(SortOrder.Asc));
                        break;
                    case "price_desc":
                        sort.Field(p => p.Price, f => f.Order(SortOrder.Desc));
                        break;
                    case "price":
                        sort.Field(p => p.Price, f => f.Order(order));
                        break;
                    case "rating":
                        sort.Field(p => p.Rating, f => f.Order(order));
                        break;
                    case "createdat":
                    case "newest":
                        sort.Field(p => p.CreatedAt, f => f.Order(order));
                        break;
                    default:
                        // Sử dụng field Name hoặc name.keyword nếu có
                        sort.Field("name.keyword", f => f.Order(order));
                        break;
                }
            });
        }

        #endregion
    }
}
