using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Inventory.Dto
{
    public class InventoryItemDto
    {
        public Guid Id { get; set; }
        public Guid ProductVariantSkuId { get; set; }
        public string SkuCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string SerialNumber { get; set; } = string.Empty;
        public EInventoryStatus Status { get; set; }
        public string StatusDisplay { get; set; } = string.Empty;
        public Guid? OrderItemId { get; set; }
        public DateTime ImportedAt { get; set; }
        public string? BatchCode { get; set; }
        public string? Notes { get; set; }
    }

    public class InventoryImportItemDto
    {
        public string SerialNumber { get; set; } = string.Empty;
        public string? BatchCode { get; set; }
    }
}
