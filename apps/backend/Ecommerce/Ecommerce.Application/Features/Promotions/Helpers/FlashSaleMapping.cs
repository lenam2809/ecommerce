using System;
using System.Linq;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Domain.Entities;

namespace Ecommerce.Application.Features.Promotions.Helpers
{
    public static class FlashSaleMapping
    {
        public static FlashSaleDto ToDto(FlashSale flashSale, DateTime? referenceTime = null)
        {
            var now = referenceTime ?? DateTime.UtcNow;
            var remainingSeconds = Math.Max(0, (long)(flashSale.EndTime - now).TotalSeconds);

            return new FlashSaleDto
            {
                Id = flashSale.Id,
                Code = flashSale.Code,
                Title = flashSale.Title,
                Subtitle = flashSale.Subtitle,
                BannerImageUrl = flashSale.BannerImageUrl,
                StartTime = flashSale.StartTime,
                EndTime = flashSale.EndTime,
                IsActive = flashSale.IsActive,
                Priority = flashSale.Priority,
                TimeRemainingSeconds = remainingSeconds,
                Items = (flashSale.Items ?? Enumerable.Empty<FlashSaleItem>())
                    .OrderBy(i => i.DisplayOrder)
                    .Select(i =>
                    {
                        var originalPrice = i.OriginalPrice > 0 ? i.OriginalPrice : (i.Product?.Price ?? 0);
                        var discountPercent = originalPrice > 0 && originalPrice > i.FlashSalePrice
                            ? (int)Math.Round((originalPrice - i.FlashSalePrice) / originalPrice * 100)
                            : 0;

                        return new FlashSaleItemDto
                        {
                            Id = i.Id,
                            FlashSaleId = i.FlashSaleId,
                            ProductId = i.ProductId,
                            ProductName = i.Product?.Name ?? string.Empty,
                            ProductSlug = i.Product?.Slug ?? string.Empty,
                            ProductImageUrl = i.Product?.Image,
                            ProductVariantSkuId = i.ProductVariantSkuId,
                            Sku = i.ProductVariantSku?.Sku ?? i.Product?.Sku,
                            FlashSalePrice = i.FlashSalePrice,
                            OriginalPrice = originalPrice,
                            DiscountPercentage = discountPercent,
                            TotalQuota = i.TotalQuota,
                            SoldCount = i.SoldCount,
                            RemainingQuantity = Math.Max(0, i.TotalQuota - i.SoldCount),
                            MaxPerCustomer = i.MaxPerCustomer,
                            IsHeroFeatured = i.IsHeroFeatured,
                            BadgeText = i.BadgeText,
                            DisplayOrder = i.DisplayOrder,
                            KeySpecs = i.Product?.Specifications?
                                .Where(s => s.IsKeySpec)
                                .OrderBy(s => s.DisplayOrder)
                                .Select(s => $"{s.Name}: {s.Value}")
                                .ToList() ?? new()
                        };
                    }).ToList()
            };
        }
    }
}
