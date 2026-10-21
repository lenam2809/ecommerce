using System;
using System.Collections.Generic;

namespace Ecommerce.Application.Features.Promotions.Dto
{
    public class FlashSaleDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Subtitle { get; set; }
        public string? BannerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsActive { get; set; }
        public int Priority { get; set; }
        public long TimeRemainingSeconds { get; set; }
        public List<FlashSaleItemDto> Items { get; set; } = new();
    }

    public class FlashSaleItemDto
    {
        public Guid Id { get; set; }
        public Guid FlashSaleId { get; set; }
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSlug { get; set; } = string.Empty;
        public string? ProductImageUrl { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public string? Sku { get; set; }
        public decimal FlashSalePrice { get; set; }
        public decimal FlashPrice => FlashSalePrice;
        public decimal OriginalPrice { get; set; }
        public int DiscountPercentage { get; set; }
        public int TotalQuota { get; set; }
        public int QuantityLimit => TotalQuota;
        public int SoldCount { get; set; }
        public int SoldQuantity => SoldCount;
        public int RemainingQuantity { get; set; }
        public int MaxPerCustomer { get; set; }
        public bool IsHeroFeatured { get; set; }
        public string? BadgeText { get; set; }
        public int DisplayOrder { get; set; }
        public List<string> KeySpecs { get; set; } = new();
    }
}
