using Ecommerce.Application.Features.Products.Dto;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IElasticsearchIndexService
    {
        Task IndexProductAsync(ProductSearchResultDto product, CancellationToken cancellationToken = default);
        Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default);
    }
}
