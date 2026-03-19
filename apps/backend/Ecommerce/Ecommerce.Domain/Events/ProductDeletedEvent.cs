using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Event được publish khi xóa Product — dùng để sync Elasticsearch.
    /// </summary>
    public class ProductDeletedEvent : INotification
    {
        public Guid ProductId { get; }

        public ProductDeletedEvent(Guid productId)
        {
            ProductId = productId;
        }
    }
}
