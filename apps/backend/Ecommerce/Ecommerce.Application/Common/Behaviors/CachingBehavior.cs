using Ecommerce.Application.Common.Attributes;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using MediatR;
using System.Reflection;
using System.Text.Json;

namespace Ecommerce.Application.Common.Behaviors
{
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : class

    {
        private readonly ICacheService _cacheService;

        public CachingBehavior(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var cacheAttr = typeof(TRequest).GetCustomAttribute<CacheableAttribute>();
            if (cacheAttr == null)
            {
                return await next(); // Không cache
            }

            // Tạo cache key từ request
            string cacheKey = $"{cacheAttr.Prefix}_{JsonSerializer.Serialize(request)}";
            var cached = await _cacheService.GetAsync<TResponse>(cacheKey);
            if (cached != null)
            {
                return cached;
            }

            var result = await next();
            await _cacheService.SetAsync(cacheKey, result, cacheAttr.Policy.ToTimeSpan());

            return result;
        }
    }

}

