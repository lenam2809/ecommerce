namespace Ecommerce.Application.Common.Interfaces
{
    public interface IElasticsearchSyncService
    {
        Task ReindexAllAsync(CancellationToken cancellationToken = default);
    }
}
