using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.UserActivities.Dto;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databasePath = Path.Combine(
        Path.GetTempPath(),
        "ecommerce-integration-tests",
        $"{Guid.NewGuid():N}.db");
    private readonly Dictionary<string, string?> _previousEnvironmentValues = new();

    public CustomWebApplicationFactory()
    {
        SetEnvironmentVariable("ConnectionStrings__DefaultConnection", $"Data Source={_databasePath}");
        SetEnvironmentVariable("Jwt__SecretKey", "integration-test-secret-key-with-more-than-32-chars");
        SetEnvironmentVariable("Jwt__Issuer", "Ecommerce.IntegrationTests");
        SetEnvironmentVariable("Jwt__Audience", "Ecommerce.IntegrationTests");
        SetEnvironmentVariable("Jwt__AccessTokenExpirationMinutes", "60");
        SetEnvironmentVariable("AuthConfig__UseCookieAuth", "true");
        SetEnvironmentVariable("AuthConfig__AllowHeaderFallback", "true");
        SetEnvironmentVariable("AuthConfig__IncludeTokensInResponse", "true");
        SetEnvironmentVariable("AuthConfig__EnableCsrfProtection", "false");
        SetEnvironmentVariable("Auth__TokenHashSecret", "integration-test-refresh-token-hash-secret");
        SetEnvironmentVariable("Elasticsearch__UseElasticsearch", "false");
        SetEnvironmentVariable("CacheSettings__UseRedis", "false");
        SetEnvironmentVariable("Redis__ConnectionString", "localhost:6379");
        SetEnvironmentVariable("Observability__OtlpEndpoint", "http://localhost:4317");
        SetEnvironmentVariable("Email__Smtp__Host", string.Empty);
    }

    public IServiceScope CreateScope()
    {
        return Services.CreateScope();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTesting");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_databasePath}",
                ["Jwt:SecretKey"] = "integration-test-secret-key-with-more-than-32-chars",
                ["Jwt:Issuer"] = "Ecommerce.IntegrationTests",
                ["Jwt:Audience"] = "Ecommerce.IntegrationTests",
                ["Jwt:AccessTokenExpirationMinutes"] = "60",
                ["AuthConfig:UseCookieAuth"] = "true",
                ["AuthConfig:AllowHeaderFallback"] = "true",
                ["AuthConfig:IncludeTokensInResponse"] = "true",
                ["AuthConfig:EnableCsrfProtection"] = "false",
                ["Auth:TokenHashSecret"] = "integration-test-refresh-token-hash-secret",
                ["Elasticsearch:UseElasticsearch"] = "false",
                ["CacheSettings:UseRedis"] = "false",
                ["Redis:ConnectionString"] = "localhost:6379",
                ["Observability:OtlpEndpoint"] = "http://localhost:4317",
                ["Email:Smtp:Host"] = ""
            });
        });

        builder.ConfigureServices(services =>
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_databasePath)!);

            services.RemoveAll<IFileStorageService>();
            services.AddScoped<IFileStorageService, TestFileStorageService>();

            services.RemoveAll<ICacheService>();
            services.RemoveAll<ICacheInvalidationService>();
            services.AddSingleton<ICacheService, NoOpCacheService>();
            services.AddSingleton<ICacheInvalidationService, NoOpCacheInvalidationService>();

            services.RemoveAll<IUserActivityService>();
            services.AddSingleton<IUserActivityService, NoOpUserActivityService>();

            services.RemoveAll<IDistributedCache>();
            services.AddDistributedMemoryCache();

            services.RemoveAll<IProductSearchService>();
            services.RemoveAll<IElasticsearchIndexService>();
            services.AddSingleton<TestProductSearchService>();
            services.AddSingleton<IProductSearchService>(sp => sp.GetRequiredService<TestProductSearchService>());
            services.AddSingleton<IElasticsearchIndexService>(sp => sp.GetRequiredService<TestProductSearchService>());
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        foreach (var (key, value) in _previousEnvironmentValues)
        {
            Environment.SetEnvironmentVariable(key, value);
        }

        SqliteConnection.ClearAllPools();

        for (var attempt = 0; attempt < 5 && File.Exists(_databasePath); attempt++)
        {
            try
            {
                File.Delete(_databasePath);
                break;
            }
            catch (IOException) when (attempt < 4)
            {
                Thread.Sleep(100);
            }
        }
    }

    private void SetEnvironmentVariable(string key, string? value)
    {
        _previousEnvironmentValues[key] = Environment.GetEnvironmentVariable(key);
        Environment.SetEnvironmentVariable(key, value);
    }

    private sealed class TestFileStorageService : IFileStorageService
    {
        public Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            var fileName = string.IsNullOrWhiteSpace(file.FileName) ? "test.png" : file.FileName;
            return Task.FromResult($"https://cdn.test/{folderName.Trim('/')}/{fileName}");
        }

        public Task<bool> DeleteFileAsync(string filePath)
        {
            return Task.FromResult(true);
        }

        public Task<string> GetFileUrlAsync(string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                return Task.FromResult(string.Empty);
            }

            return Task.FromResult(relativePath.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? relativePath
                : $"https://cdn.test/{relativePath.TrimStart('/')}");
        }
    }

    private sealed class NoOpCacheService : ICacheService
    {
        public Task<T?> GetAsync<T>(string key) where T : class => Task.FromResult<T?>(null);
        public Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null) where T : class => Task.CompletedTask;
        public Task RemoveAsync(string key) => Task.CompletedTask;
        public Task RemoveByPrefixAsync(string prefixKey) => Task.CompletedTask;
        public Task TrackKeyAsync(string tag, string key, TimeSpan? expiration = null) => Task.CompletedTask;
        public Task RemoveByTagAsync(string tag) => Task.CompletedTask;
    }

    private sealed class NoOpCacheInvalidationService : ICacheInvalidationService
    {
        public Task InvalidateUserCache(Guid userId) => Task.CompletedTask;
        public Task InvalidateRoleCache(string role) => Task.CompletedTask;
        public Task InvalidateAllUsersCache() => Task.CompletedTask;
        public Task InvalidateTenantCache(Guid tenantId) => Task.CompletedTask;
        public Task InvalidateAllTenantsCache() => Task.CompletedTask;
        public Task InvalidateProductCache(Guid productId) => Task.CompletedTask;
        public Task InvalidateCategoryCache(Guid categoryId) => Task.CompletedTask;
        public Task InvalidateBrandCache(Guid brandId) => Task.CompletedTask;
        public Task InvalidateBannerCache(Guid bannerId) => Task.CompletedTask;
        public Task InvalidateAboutCache(Guid aboutId) => Task.CompletedTask;
        public Task InvalidateContactCache(Guid contactId) => Task.CompletedTask;
    }

    private sealed class NoOpUserActivityService : IUserActivityService
    {
        public Task LogActivityAsync(string activityType, string? description = null, object? additionalData = null, Guid? userId = null)
        {
            return Task.CompletedTask;
        }

        public Task<IEnumerable<UserActivityDto>> GetRecentActivitiesAsync(int count = 10)
        {
            return Task.FromResult<IEnumerable<UserActivityDto>>([]);
        }

        public Task<IEnumerable<UserActivityDto>> GetUserActivitiesAsync(Guid userId, DateTime? from = null, DateTime? to = null)
        {
            return Task.FromResult<IEnumerable<UserActivityDto>>([]);
        }
    }

    private sealed class TestProductSearchService : IProductSearchService
    {
        public Task<(List<ProductSearchResultDto> Items, long TotalCount)> SearchProductsAsync(
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
            return Task.FromResult((new List<ProductSearchResultDto>(), 0L));
        }

        public Task<List<ProductSuggestionDto>> GetSuggestionsAsync(string query, int limit = 5, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new List<ProductSuggestionDto>());
        }

        public Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task UpdateProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task BulkIndexAsync(IEnumerable<ProductSearchResultDto> products, CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
