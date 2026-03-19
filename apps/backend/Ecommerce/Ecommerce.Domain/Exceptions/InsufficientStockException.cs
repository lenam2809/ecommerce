namespace Ecommerce.Domain.Exceptions
{
    /// <summary>
    /// Exception thrown when there is insufficient stock for a product
    /// </summary>
    public class InsufficientStockException : DomainException
    {
        public Guid ProductId { get; }
        public int RequestedQuantity { get; }
        public int AvailableStock { get; }

        public InsufficientStockException(Guid productId, int requested, int available)
            : base($"Insufficient stock for product {productId}. Requested: {requested}, Available: {available}")
        {
            ProductId = productId;
            RequestedQuantity = requested;
            AvailableStock = available;
        }
    }
}
