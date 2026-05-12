using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Common.Services;
using Ecommerce.Domain.Enums;
using MediatR;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Ecommerce.Application.Tests.Caching
{
    public class CachingBehaviorTests
    {
        [Fact]
        public async Task Handle_ReturnsCachedValue_WithoutCallingHandler()
        {
            var cache = new InMemoryCacheService();
            var behavior = CreateBehavior(cache);
            var request = new TestCacheableQuery { Id = 10 };
            var handlerCalls = 0;

            var first = await behavior.Handle(request, () =>
            {
                handlerCalls++;
                return Task.FromResult(Result<string>.Success("from-handler"));
            }, CancellationToken.None);

            var second = await behavior.Handle(request, () =>
            {
                handlerCalls++;
                return Task.FromResult(Result<string>.Success("should-not-run"));
            }, CancellationToken.None);

            Assert.Equal("from-handler", first.Value);
            Assert.Equal("from-handler", second.Value);
            Assert.Equal(1, handlerCalls);
        }

        [Fact]
        public async Task Handle_WhenCacheReadFails_CallsHandler()
        {
            var cache = new InMemoryCacheService { ThrowOnGet = true };
            var behavior = CreateBehavior(cache);
            var handlerCalls = 0;

            var result = await behavior.Handle(new TestCacheableQuery { Id = 20 }, () =>
            {
                handlerCalls++;
                return Task.FromResult(Result<string>.Success("fallback"));
            }, CancellationToken.None);

            Assert.Equal("fallback", result.Value);
            Assert.Equal(1, handlerCalls);
        }

        [Fact]
        public void CacheKeyService_BuildsStableKey_ForEquivalentRequests()
        {
            var keyService = new CacheKeyService();

            var first = keyService.BuildKey(new TestCacheableQuery { Id = 1, Search = "phone" }, "products");
            var second = keyService.BuildKey(new TestCacheableQuery { Id = 1, Search = "phone" }, "products");
            var third = keyService.BuildKey(new TestCacheableQuery { Id = 2, Search = "phone" }, "products");

            Assert.Equal(first, second);
            Assert.NotEqual(first, third);
            Assert.StartsWith("query:products:", first);
        }

        private static CachingBehavior<TestCacheableQuery, Result<string>> CreateBehavior(ICacheService cache)
        {
            return new CachingBehavior<TestCacheableQuery, Result<string>>(
                cache,
                new CacheKeyService(),
                Options.Create(new CacheConfig()),
                NullLogger<CachingBehavior<TestCacheableQuery, Result<string>>>.Instance);
        }

        [Cacheable("Products_All", ECachePolicy.Short)]
        private sealed class TestCacheableQuery : IRequest<Result<string>>
        {
            public int Id { get; set; }
            public string Search { get; set; } = string.Empty;
        }

        private sealed class InMemoryCacheService : ICacheService
        {
            private readonly Dictionary<string, object> _cache = new();

            public bool ThrowOnGet { get; set; }

            public Task<T?> GetAsync<T>(string key) where T : class
            {
                if (ThrowOnGet)
                {
                    throw new InvalidOperationException("Redis unavailable");
                }

                return Task.FromResult(_cache.TryGetValue(key, out var value) ? (T?)value : null);
            }

            public Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpireTime = null, TimeSpan? slidingExpireTime = null) where T : class
            {
                _cache[key] = value;
                return Task.CompletedTask;
            }

            public Task RemoveAsync(string key)
            {
                _cache.Remove(key);
                return Task.CompletedTask;
            }

            public Task RemoveByPrefixAsync(string prefixKey)
            {
                foreach (var key in _cache.Keys.Where(k => k.StartsWith(prefixKey, StringComparison.Ordinal)).ToList())
                {
                    _cache.Remove(key);
                }

                return Task.CompletedTask;
            }

            public Task TrackKeyAsync(string tag, string key, TimeSpan? expiration = null)
            {
                return Task.CompletedTask;
            }

            public Task RemoveByTagAsync(string tag)
            {
                return Task.CompletedTask;
            }
        }
    }
}
