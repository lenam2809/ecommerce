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
            _redisConnection = serviceProvider.GetService<IConnectionMultiplexer>();
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
                    var physicalPrefix = $"{_cacheConfig.InstanceName}{prefixKey}";
                    var keys = server.Keys(pattern: physicalPrefix + "*");
                    foreach (var key in keys)
                    {
                        var logicalKey = key.ToString();
                        if (!string.IsNullOrEmpty(_cacheConfig.InstanceName) &&
                            logicalKey.StartsWith(_cacheConfig.InstanceName, StringComparison.Ordinal))
                        {
                            logicalKey = logicalKey[_cacheConfig.InstanceName.Length..];
                        }

                        await _distributedCache.RemoveAsync(logicalKey);
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

        public async Task TrackKeyAsync(string tag, string key, TimeSpan? expiration = null)
        {
            if (string.IsNullOrWhiteSpace(tag) || string.IsNullOrWhiteSpace(key) || _redisConnection == null)
            {
                return;
            }

            try
            {
                var database = _redisConnection.GetDatabase();
                var tagKey = GetTagKey(tag);

                await database.SetAddAsync(tagKey, key);

                var ttl = expiration ?? TimeSpan.FromMinutes(_cacheConfig.DefaultExpirationMinutes);
                await database.KeyExpireAsync(tagKey, ttl.Add(TimeSpan.FromMinutes(5)));
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "TrackCacheKeyAsync",
                    new Dictionary<string, object?>
                    {
                        { "CacheTag", tag },
                        { "CacheKey", key }
                    });
            }
        }

        public async Task RemoveByTagAsync(string tag)
        {
            if (string.IsNullOrWhiteSpace(tag) || _redisConnection == null)
            {
                await RemoveByPrefixAsync(tag);
                return;
            }

            try
            {
                var database = _redisConnection.GetDatabase();
                var tagKey = GetTagKey(tag);
                var keys = await database.SetMembersAsync(tagKey);

                if (keys.Length > 0)
                {
                    foreach (var key in keys.Where(k => k.HasValue))
                    {
                        await _distributedCache.RemoveAsync(key.ToString());
                    }
                }

                await database.KeyDeleteAsync(tagKey);

                await _logger.LogAsync(
                    ELogLevel.Debug,
                    "Removed cache entries by tag {CacheTag}",
                    "RemoveByTagAsync",
                    properties: new Dictionary<string, object?>
                    {
                        { "CacheTag", tag },
                        { "RemovedCount", keys.Length }
                    });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(
                    ex,
                    "RemoveByTagAsync",
                    new Dictionary<string, object?>
                    {
                        { "CacheTag", tag }
                    });
            }
        }

        private static string GetTagKey(string tag)
        {
            return $"cachetag:{tag.Trim()}";
        }
    }

    public static class CacheServiceExtensions
    {
        public static IServiceCollection AddCachingServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<CacheConfig>(configuration.GetSection("CacheSettings"));

            var cacheConfig = configuration.GetSection("CacheSettings").Get<CacheConfig>() ?? new CacheConfig();
            var redisConnection = configuration["Redis:ConnectionString"]
                ?? configuration.GetConnectionString("Redis")
                ?? cacheConfig.RedisConnection;
            var redisInstanceName = configuration["Redis:InstanceName"]
                ?? cacheConfig.InstanceName;

            cacheConfig.RedisConnection = redisConnection;
            cacheConfig.InstanceName = redisInstanceName;

            services.AddMemoryCache();

            services.AddScoped<ICacheService, CacheService>();
            services.AddScoped<ICacheInvalidationService, CacheInvalidationService>();

            services.PostConfigure<CacheConfig>(options =>
            {
                options.UseRedis = true;
                options.RedisConnection = redisConnection;
                options.InstanceName = redisInstanceName;
            });

            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = redisInstanceName;
            });

            services.AddSingleton<IConnectionMultiplexer>(_ =>
            {
                var redisOptions = ConfigurationOptions.Parse(redisConnection);
                redisOptions.AbortOnConnectFail = false;
                return ConnectionMultiplexer.Connect(redisOptions);
            });

            return services;
        }
    }
}

