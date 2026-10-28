using System;

namespace Ecommerce.Application.Features.Promotions.Dto
{
    public class FlashSaleItemInputDto
    {
        public Guid? Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid? ProductVariantSkuId { get; set; }
        public decimal FlashSalePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public int TotalQuota { get; set; }
        public int SoldCount { get; set; } = 0;
        public int MaxPerCustomer { get; set; } = 1;
        public bool IsHeroFeatured { get; set; } = false;
        public string? BadgeText { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }
}
