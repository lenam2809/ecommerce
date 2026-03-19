using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Event được publish khi cập nhật Product — dùng để sync Elasticsearch.
    /// </summary>
    public class ProductUpdatedEvent : INotification
    {
        public Guid ProductId { get; }

        public ProductUpdatedEvent(Guid productId)
        {
            ProductId = productId;
        }
    }
}
