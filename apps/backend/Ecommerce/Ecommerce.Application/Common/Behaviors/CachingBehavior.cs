using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Reflection;

namespace Ecommerce.Application.Common.Behaviors
{
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ICacheService _cacheService;
        private readonly ICacheKeyService _cacheKeyService;
        private readonly CacheConfig _cacheConfig;
        private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;

        public CachingBehavior(
            ICacheService cacheService,
            ICacheKeyService cacheKeyService,
            IOptions<CacheConfig> cacheOptions,
            ILogger<CachingBehavior<TRequest, TResponse>> logger)
        {
            _cacheService = cacheService;
            _cacheKeyService = cacheKeyService;
            _cacheConfig = cacheOptions.Value;
            _logger = logger;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var cacheMetadata = GetCacheMetadata(request);
            if (cacheMetadata == null)
            {
                return await next();
            }

            try
            {
                var cached = await _cacheService.GetAsync<ResponseEnvelope<TResponse>>(cacheMetadata.CacheKey);
                if (cached != null)
                {
                    _logger.LogDebug("Cache hit for {RequestName} with key {CacheKey}", typeof(TRequest).Name, cacheMetadata.CacheKey);
                    return cached.Value;
                }

                _logger.LogDebug("Cache miss for {RequestName} with key {CacheKey}", typeof(TRequest).Name, cacheMetadata.CacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache read failed for {RequestName}; falling back to handler", typeof(TRequest).Name);
            }

            var result = await next();

            if (result == null || IsFailureResult(result))
            {
                return result;
            }

            try
            {
                await _cacheService.SetAsync(
                    cacheMetadata.CacheKey,
                    new ResponseEnvelope<TResponse>(result),
                    cacheMetadata.AbsoluteExpiration,
                    cacheMetadata.SlidingExpiration);

                foreach (var tag in cacheMetadata.Tags)
                {
                    await _cacheService.TrackKeyAsync(tag, cacheMetadata.CacheKey, cacheMetadata.AbsoluteExpiration);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache write failed for {RequestName}; returning handler result", typeof(TRequest).Name);
            }

            return result;
        }

        private CacheMetadata? GetCacheMetadata(TRequest request)
        {
            if (request is ICacheableQuery cacheableQuery)
            {
                var key = string.IsNullOrWhiteSpace(cacheableQuery.CacheKey)
                    ? _cacheKeyService.BuildKey(request)
                    : cacheableQuery.CacheKey;

                return new CacheMetadata(
                    key,
                    cacheableQuery.Expiration ?? TimeSpan.FromMinutes(_cacheConfig.DefaultExpirationMinutes),
                    cacheableQuery.SlidingExpiration,
                    cacheableQuery.Tags);
            }

            var cacheAttr = typeof(TRequest).GetCustomAttribute<CacheAttribute>();
            if (cacheAttr == null)
            {
                return null;
            }

            var absoluteExpiration = cacheAttr.DurationMinutes.HasValue
                ? TimeSpan.FromMinutes(cacheAttr.DurationMinutes.Value)
                : GetExpiration(cacheAttr);

            var slidingExpiration = cacheAttr.SlidingExpirationMinutes.HasValue
                ? TimeSpan.FromMinutes(cacheAttr.SlidingExpirationMinutes.Value)
                : TimeSpan.FromMinutes(_cacheConfig.DefaultSlidingExpirationMinutes);

            var tags = cacheAttr.Tags.Length > 0
                ? cacheAttr.Tags
                : [cacheAttr.Prefix];

            return new CacheMetadata(
                _cacheKeyService.BuildKey(request, cacheAttr.Prefix),
                absoluteExpiration,
                slidingExpiration,
                tags);
        }

        private TimeSpan GetExpiration(CacheAttribute attribute)
        {
            if (attribute.Prefix.Contains("Product", StringComparison.OrdinalIgnoreCase))
            {
                return TimeSpan.FromMinutes(_cacheConfig.ProductExpirationMinutes);
            }

            if (attribute.Prefix.Contains("Category", StringComparison.OrdinalIgnoreCase))
            {
                return TimeSpan.FromMinutes(_cacheConfig.CategoryExpirationMinutes);
            }

            if (attribute.Prefix.Contains("Brand", StringComparison.OrdinalIgnoreCase))
            {
                return TimeSpan.FromMinutes(_cacheConfig.BrandExpirationMinutes);
            }

            return attribute.Policy == ECachePolicy.Short
                ? TimeSpan.FromMinutes(_cacheConfig.DefaultExpirationMinutes)
                : attribute.Policy.ToTimeSpan();
        }

        private static bool IsFailureResult(TResponse result)
        {
            var isSuccessProperty = typeof(TResponse).GetProperty("IsSuccess");
            return isSuccessProperty?.PropertyType == typeof(bool) &&
                isSuccessProperty.GetValue(result) is false;
        }

        private sealed record CacheMetadata(
            string CacheKey,
            TimeSpan AbsoluteExpiration,
            TimeSpan? SlidingExpiration,
            IReadOnlyCollection<string> Tags);

        private sealed record ResponseEnvelope<T>(T Value);
    }
}
