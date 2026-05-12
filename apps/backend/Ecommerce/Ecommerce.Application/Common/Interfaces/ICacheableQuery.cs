namespace Ecommerce.Application.Common.Interfaces
{
    public interface ICacheableQuery
    {
        string CacheKey { get; }
        TimeSpan? Expiration { get; }
        TimeSpan? SlidingExpiration { get; }
        IReadOnlyCollection<string> Tags { get; }
    }
}
