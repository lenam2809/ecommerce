using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Event được publish khi tạo mới Product — dùng để sync Elasticsearch.
    /// </summary>
    public class ProductCreatedEvent : INotification
    {
        public Guid ProductId { get; }

        public ProductCreatedEvent(Guid productId)
        {
            ProductId = productId;
        }
    }
}
