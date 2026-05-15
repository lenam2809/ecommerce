namespace Ecommerce.Application.Features.Orders.Dto
{
    public class CreateOrderItemDto
    {
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public int Quantity { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
    }
}

