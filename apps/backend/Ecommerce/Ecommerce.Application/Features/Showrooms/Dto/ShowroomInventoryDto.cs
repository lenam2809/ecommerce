using System;

namespace Ecommerce.Application.Features.Showrooms.Dto
{
    public class ShowroomInventoryDto
    {
        public Guid ShowroomId { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductImage { get; set; } = string.Empty;
        public string SkuCode { get; set; } = string.Empty;
        public string VariantInfo { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity => Math.Max(0, Quantity - ReservedQuantity);
        public bool IsAvailableFor2hDelivery { get; set; } = true;
        public DateTime? UpdatedAt { get; set; }
    }
}
