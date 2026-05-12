namespace Ecommerce.Application.Common.Interfaces
{
    public interface ICacheKeyService
    {
        string BuildKey<TRequest>(TRequest request, string? prefix = null);
    }
}
