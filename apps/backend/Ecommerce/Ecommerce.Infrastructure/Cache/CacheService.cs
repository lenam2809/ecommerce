using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Infrastructure.Services;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Cache
{
    public class CacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly IEnhancedLogger _logger;
        private readonly CacheConfig _cacheConfig;
        private readonly IConnectionMultiplexer? _redisConnection;

        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles,
            PropertyNameCaseInsensitive = true
        };

        public CacheService(IDistributedCache distributedCache, IEnhancedLogger logger, IOptions<CacheConfig> cacheOptions, IServiceProvider serviceProvider)
        {
            _distributedCache = distributedCache;
            _logger = logger;
            _cacheConfig = cacheOptions.Value;
            if (_cacheConfig.UseRedis)
            {
                _redisConnection = serviceProvider.GetService<IConnectionMultiplexer>();
            }
        }

        public async Task<T?> GetAsync<T>(string key) where T : class
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Cache key không được rỗng hoặc chỉ chứa khoảng trắng.", nameof(key));
            try
            {
                var cachedData = await _distributedCache.GetStringAsync(key);

                if (string.IsNullOrEmpty(cachedData))
                {
                    return null;
                }

                var result = JsonSerializer.Deserialize<T>(cachedData, _jsonOptions);
                await _logger.LogAsync(
                    ELogLevel.Debug,
                    "Retrieved cache entry for {CacheKey}",
                    "GetCacheAsync",
                    properties: new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
                return result;
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "GetCacheAsync",
                    new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
                return null;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null) where T : class
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Cache key không được rỗng hoặc chỉ chứa khoảng trắng.", nameof(key));

            if (value == null)
                throw new ArgumentNullException(nameof(value), "Giá trị cache không được null.");

            try
            {
                var options = new DistributedCacheEntryOptions();

                if (absoluteExpireTime.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = absoluteExpireTime.Value;
                }
                else
                {
                    options.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_cacheConfig.DefaultExpirationMinutes);
                }

                if (slidingExpireTime.HasValue)
                {
                    options.SlidingExpiration = slidingExpireTime.Value;
                }

                var serializedData = JsonSerializer.Serialize(value, _jsonOptions);
                await _distributedCache.SetStringAsync(key, serializedData, options);
                await _logger.LogAsync(
                    ELogLevel.Debug,
                    "Stored cache entry for {CacheKey}",
                    "SetCacheAsync",
                    properties: new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "SetCacheAsync",
                    new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
            }
        }

        public async Task RemoveAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ArgumentException("Cache key không được rỗng hoặc chỉ chứa khoảng trắng.", nameof(key));
            try
            {
                await _distributedCache.RemoveAsync(key);
                await _logger.LogAsync(
                    ELogLevel.Debug,
                    "Removed cache entry for {CacheKey}",
                    "RemoveCacheAsync",
                    properties: new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "RemoveCacheAsync",
                    new Dictionary<string, object?>
                    {
                        { "CacheKey", key }
                    });
            }
        }

        public async Task RemoveByPrefixAsync(string prefixKey)
        {
            if (string.IsNullOrWhiteSpace(prefixKey))
                return;

            try
            {
                if (_redisConnection != null)
                {
                    var server = _redisConnection.GetServer(_redisConnection.GetEndPoints().First());
                    var keys = server.Keys(pattern: prefixKey + "*");
                    foreach (var key in keys)
                    {
                        await _distributedCache.RemoveAsync(key);
                    }
                    await _logger.LogAsync(
                        ELogLevel.Debug,
                        "Removed cache entries by prefix {PrefixKey}",
                        "RemoveByPrefixAsync",
                        properties: new Dictionary<string, object?>
                        {
                            { "PrefixKey", prefixKey }
                        });
                }
                else
                {
                    await _logger.LogAsync(ELogLevel.Warning, "RemoveByPrefixAsync chỉ hỗ trợ Redis hiện tại.", "RemoveByPrefixAsync");
                }
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "RemoveByPrefixAsync",
                    new Dictionary<string, object?>
                    {
                        { "PrefixKey", prefixKey }
                    });
            }
        }
    }

    public static class CacheServiceExtensions
    {
        public static IServiceCollection AddCachingServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Đăng ký cấu hình CacheConfig
            services.Configure<CacheConfig>(configuration.GetSection("CacheSettings"));

            var cacheConfig = configuration.GetSection("CacheSettings").Get<CacheConfig>() ?? new CacheConfig { RedisConnection = string.Empty };

            services.AddMemoryCache();

            // Đăng ký ICacheService
            services.AddScoped<ICacheService, CacheService>();
            services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();

            // Cấu hình cache
            if (cacheConfig.UseRedis)
            {
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = cacheConfig.RedisConnection;
                    options.InstanceName = cacheConfig.InstanceName;
                });
                
                services.AddSingleton<IConnectionMultiplexer>(sp => ConnectionMultiplexer.Connect(cacheConfig.RedisConnection));
            }
            else
            {
                services.AddDistributedMemoryCache();
            }

            return services;
        }
    }
}

