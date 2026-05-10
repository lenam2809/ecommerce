using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Infrastructure.Elasticsearch;
using Ecommerce.Infrastructure.Elasticsearch.Documents;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Infrastructure.Extensions
{
    public static class AddElasticsearchExtensions
    {
        /// <summary>
        /// Đăng ký Elasticsearch Client, tạo Index Mapping, và register IProductSearchService.
        /// </summary>
        public static IServiceCollection AddElasticsearch(
            this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<ElasticsearchOptions>(configuration.GetSection(ElasticsearchOptions.SectionName));

            var options = configuration
                .GetSection(ElasticsearchOptions.SectionName)
                .Get<ElasticsearchOptions>() ?? new ElasticsearchOptions();

            var useElasticsearch = options.UseElasticsearch;
            if (!useElasticsearch)
            {
                services.AddScoped<IProductSearchService, NoOpProductSearchService>();
                services.AddScoped<IElasticsearchIndexService>(sp => sp.GetRequiredService<IProductSearchService>());
                return services;
            }

            var uri = options.Uri;
            var indexName = options.ResolvedIndexName;

            // Cấu hình Elasticsearch Client
            var settings = new ElasticsearchClientSettings(new Uri(uri))
                .DefaultIndex(indexName)
                .DefaultMappingFor<ProductDocument>(m => m
                    .IndexName(indexName)
                    .IdProperty(p => p.Id)
                )
                .EnableDebugMode() // Bật debug mode cho dev (nên tắt ở production)
                .RequestTimeout(TimeSpan.FromSeconds(30));

            if (!string.IsNullOrWhiteSpace(options.Username) &&
                !string.IsNullOrWhiteSpace(options.Password))
            {
                settings.Authentication(new BasicAuthentication(options.Username, options.Password));
            }

            // Tắt SSL verification nếu cần (dev environment)
            if (!options.EnableSsl)
            {
                settings.ServerCertificateValidationCallback(
                    (sender, certificate, chain, sslPolicyErrors) => true);
            }

            var client = new ElasticsearchClient(settings);

            // Register singleton ElasticsearchClient (thread-safe)
            services.AddSingleton(client);

            // Register IProductSearchService
            services.AddScoped<IProductSearchService, ElasticsearchProductSearchService>();
            services.AddScoped<IElasticsearchIndexService>(sp => sp.GetRequiredService<IProductSearchService>());
            services.AddScoped<IElasticsearchSyncService, ElasticsearchSyncService>();

            // Register HostedService cho initial sync
            services.AddHostedService<ElasticsearchInitialSyncService>();

            // Tạo index nếu chưa tồn tại (thực hiện khi startup)
            CreateIndexIfNotExistsAsync(client, indexName, services.BuildServiceProvider()
                .GetService<ILogger<ElasticsearchProductSearchService>>())
                .GetAwaiter().GetResult();

            return services;
        }

        /// <summary>
        /// Tạo Elasticsearch index với mapping tối ưu cho tiếng Việt.
        /// </summary>
        private static async Task CreateIndexIfNotExistsAsync(
            ElasticsearchClient client, string indexName, ILogger? logger)
        {
            try
            {
                var existsResponse = await client.Indices.ExistsAsync(indexName);
                if (existsResponse.Exists)
                {
                    logger?.LogInformation("Elasticsearch index '{IndexName}' đã tồn tại", indexName);
                    return;
                }

                var createResponse = await client.Indices.CreateAsync(indexName, c => c
                    .Settings(s => s
                        .NumberOfShards(1)
                        .NumberOfReplicas(0) // Dev: 0 replica, Production nên đặt 1+
                        .Analysis(a => a
                            // Custom analyzer cho tiếng Việt
                            .Analyzers(an => an
                                .Custom("vietnamese_analyzer", ca => ca
                                    .Tokenizer("icu_tokenizer")
                                    .Filter(new[] { "icu_folding", "lowercase" })
                                )
                            )
                        )
                    )
                    .Mappings(m => m
                        .Properties<ProductDocument>(p => p
                            // --- Text fields (full-text searchable) ---
                            .Text(t => t.Name, t => t
                                .Analyzer("vietnamese_analyzer")
                                .Fields(f => f
                                    .Keyword("keyword") // Cho sorting
                                )
                            )
                            .Text(t => t.Description, t => t
                                .Analyzer("vietnamese_analyzer")
                            )
                            .Text(t => t.Tags, t => t
                                .Analyzer("vietnamese_analyzer")
                            )

                            // --- Keyword fields (exact match, filter, aggregation) ---
                            .Keyword(t => t.Code)
                            .Keyword(t => t.Sku)
                            .Keyword(t => t.Slug)
                            .Keyword(t => t.CategoryId)
                            .Keyword(t => t.CategorySlug)
                            .Keyword(t => t.BrandId)
                            .Keyword(t => t.BrandSlug)
                            .Keyword(t => t.Image)
                            .Keyword(t => t.MainImage)
                            .Text(t => t.CategoryName, t => t
                                .Analyzer("vietnamese_analyzer")
                                .Fields(f => f.Keyword("keyword"))
                            )
                            .Text(t => t.BrandName, t => t
                                .Analyzer("vietnamese_analyzer")
                                .Fields(f => f.Keyword("keyword"))
                            )

                            // --- Numeric fields ---
                            .DoubleNumber(t => t.Price)
                            .DoubleNumber(t => t.SalePrice)
                            .IntegerNumber(t => t.StockQuantity)
                            .FloatNumber(t => t.Rating)
                            .IntegerNumber(t => t.ReviewCount)

                            // --- Boolean ---
                            .Boolean(t => t.IsActive)

                            // --- Date ---
                            .Date(t => t.CreatedAt)
                            .Date(t => t.UpdatedAt)

                            // --- Completion Suggester ---
                            .Completion(t => t.Suggest)
                        )
                    )
                );

                if (createResponse.IsValidResponse)
                {
                    logger?.LogInformation("Đã tạo Elasticsearch index '{IndexName}' thành công với Vietnamese analyzer", indexName);
                }
                else
                {
                    logger?.LogWarning("Không thể tạo Elasticsearch index '{IndexName}': {DebugInfo}",
                        indexName, createResponse.DebugInformation);
                }
            }
            catch (Exception ex)
            {
                logger?.LogWarning(ex,
                    "Không thể kết nối Elasticsearch tại startup. Search sẽ không khả dụng cho đến khi Elasticsearch online. " +
                    "Các tính năng SQL hiện tại vẫn hoạt động bình thường.");
            }
        }
    }
}
