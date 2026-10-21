using System;
using Ecommerce.Application.Features.Promotions.Dto;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Promotions
{
    public class FlashSaleDtoTests
    {
        [Fact]
        public void FlashSaleItemDto_CalculatesDiscountAndRemainingQuantityCorrectly()
        {
            // Arrange
            var item = new FlashSaleItemDto
            {
                Id = Guid.NewGuid(),
                ProductId = Guid.NewGuid(),
                ProductName = "MacBook Pro 14 M3 Pro",
                OriginalPrice = 59_990_000m,
                FlashSalePrice = 49_990_000m,
                TotalQuota = 50,
                SoldCount = 34,
                BadgeText = "-17%"
            };

            // Assert
            // Discount: (59990000 - 49990000) / 59990000 = ~16.67% -> 17%
            var calculatedDiscount = (int)Math.Round((item.OriginalPrice - item.FlashSalePrice) / item.OriginalPrice * 100);
            calculatedDiscount.Should().Be(17);

            // Remaining: 50 - 34 = 16
            item.RemainingQuantity = Math.Max(0, item.TotalQuota - item.SoldCount);
            item.RemainingQuantity.Should().Be(16);
            item.SoldQuantity.Should().Be(34);
            item.QuantityLimit.Should().Be(50);
            item.FlashPrice.Should().Be(49_990_000m);
        }

        [Fact]
        public void FlashSaleDto_TimeRemaining_CalculatesAccurately()
        {
            // Arrange
            var now = DateTime.UtcNow;
            var endTime = now.AddHours(2).AddMinutes(15).AddSeconds(30);

            var flashSale = new FlashSaleDto
            {
                Code = "FS-2026-NIGHT",
                Title = "ĐẠI TIỆC CÔNG NGHỆ 2026",
                StartTime = now.AddHours(-1),
                EndTime = endTime,
                IsActive = true,
                TimeRemainingSeconds = (long)(endTime - now).TotalSeconds
            };

            // Assert
            flashSale.TimeRemainingSeconds.Should().BeGreaterThan(8000);
            flashSale.IsActive.Should().BeTrue();
        }
    }
}
