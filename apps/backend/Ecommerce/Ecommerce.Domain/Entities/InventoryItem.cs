using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Theo dõi từng đơn vị vật lý (IMEI/Serial Number) trong kho.
    /// Mỗi InventoryItem thuộc về một ProductVariantSku và có thể được gắn với một OrderItem khi bán.
    /// </summary>
    public class InventoryItem : BaseEntity
    {
        [ForeignKey(nameof(ProductVariantSku))]
        public Guid ProductVariantSkuId { get; private set; }

        [Required]
        [StringLength(100)]
        public string SerialNumber { get; private set; } = string.Empty; // IMEI hoặc Serial

        public EInventoryStatus Status { get; private set; }

        [ForeignKey(nameof(OrderItem))]
        public Guid? OrderItemId { get; private set; }  // Gắn khi bán

        public DateTime ImportedAt { get; private set; }

        [StringLength(50)]
        public string? BatchCode { get; private set; }  // Lô nhập hàng "BATCH-2026-03-001"

        [StringLength(500)]
        public string? Notes { get; private set; }

        // Navigation properties
        public virtual ProductVariantSku ProductVariantSku { get; private set; } = null!;
        public virtual OrderItem? OrderItem { get; private set; }

        // EF Core constructor
        private InventoryItem() { }

        public static InventoryItem Create(Guid skuId, string serialNumber, string? batchCode = null)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
                throw new DomainException("IMEI/Serial Number không được để trống.");

            return new InventoryItem
            {
                ProductVariantSkuId = skuId,
                SerialNumber = serialNumber.Trim(),
                Status = EInventoryStatus.Available,
                ImportedAt = DateTime.UtcNow,
                BatchCode = batchCode
            };
        }

        public void Reserve(Guid orderItemId)
        {
            if (Status != EInventoryStatus.Available)
                throw new DomainException($"IMEI/Serial {SerialNumber} không khả dụng (trạng thái: {Status}).");
            Status = EInventoryStatus.Reserved;
            OrderItemId = orderItemId;
        }

        public void ConfirmSold()
        {
            if (Status != EInventoryStatus.Reserved)
                throw new DomainException($"IMEI/Serial {SerialNumber} chưa được reserve.");
            Status = EInventoryStatus.Sold;
        }

        public void Release()
        {
            Status = EInventoryStatus.Available;
            OrderItemId = null;
        }

        public void ReturnToStock(string? notes = null)
        {
            Status = EInventoryStatus.ReturnedToStock;
            OrderItemId = null;
            Notes = notes;
        }

        public void MarkDefective(string? notes)
        {
            Status = EInventoryStatus.Defective;
            Notes = notes;
        }
    }
}
