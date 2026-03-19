using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Products.EventHandlers
{
    /// <summary>
    /// Khi Product bị xóa → Xóa document khỏi Elasticsearch.
    /// </summary>
    public class ProductDeletedEventHandler : INotificationHandler<ProductDeletedEvent>
    {
        private readonly IProductSearchService _productSearchService;
        private readonly ILogger<ProductDeletedEventHandler> _logger;

        public ProductDeletedEventHandler(
            IProductSearchService productSearchService,
            ILogger<ProductDeletedEventHandler> logger)
        {
            _productSearchService = productSearchService;
            _logger = logger;
        }

        public async Task Handle(ProductDeletedEvent notification, CancellationToken cancellationToken)
        {
            try
            {
                await _productSearchService.DeleteProductAsync(notification.ProductId, cancellationToken);
                _logger.LogInformation("Đã xóa Product {ProductId} khỏi Elasticsearch (Deleted)", notification.ProductId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa Product {ProductId} khỏi Elasticsearch (Deleted)", notification.ProductId);
            }
        }
    }
}
