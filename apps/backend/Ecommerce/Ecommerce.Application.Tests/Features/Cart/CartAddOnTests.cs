using System;
using System.Linq;
using Ecommerce.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Cart
{
    public class CartAddOnTests
    {
        [Fact]
        public void CartItem_TotalPrice_IncludesAddOnPrice()
        {
            // Arrange
            var product = Product.Create(
                "P001", "MacBook Pro 14", "macbook-pro-14", "MBP-14",
                50_000_000m, 48_000_000m, "macbook.png", "Description",
                10, Guid.NewGuid(), Guid.NewGuid());

            var cartItem = new CartItem(Guid.NewGuid(), product, 2, "Space Gray", "14-inch")
            {
                AddOnId = Guid.NewGuid(),
                AddOnPrice = 4_500_000m // AppleCare+
            };

            // Act & Assert
            // (48,000,000 + 4,500,000) * 2 = 105,000,000
            cartItem.TotalPrice.Should().Be(105_000_000m);
        }

        [Fact]
        public void Cart_AddItem_WithDifferentAddOns_CreatesDistinctCartItems()
        {
            // Arrange
            var cart = new Domain.Entities.Cart();
            var product = Product.Create(
                "P001", "MacBook Pro 14", "macbook-pro-14", "MBP-14",
                50_000_000m, null, "macbook.png", "Description",
                10, Guid.NewGuid(), Guid.NewGuid());

            var appleCareId = Guid.NewGuid();
            var caseAddOnId = Guid.NewGuid();

            // Act
            cart.AddItem(product, 1, "Space Gray", "Default", appleCareId, 4_500_000m);
            cart.AddItem(product, 1, "Space Gray", "Default", caseAddOnId, 500_000m);

            // Assert
            cart.CartItems.Should().HaveCount(2);
            cart.CartItems.Should().Contain(i => i.AddOnId == appleCareId && i.AddOnPrice == 4_500_000m);
            cart.CartItems.Should().Contain(i => i.AddOnId == caseAddOnId && i.AddOnPrice == 500_000m);
        }

        [Fact]
        public void Cart_AddItem_WithSameAddOn_IncrementsQuantity()
        {
            // Arrange
            var cart = new Domain.Entities.Cart();
            var product = Product.Create(
                "P002", "iPhone 15", "iphone-15", "IPH-15",
                25_000_000m, null, "iphone.png", "Description",
                10, Guid.NewGuid(), Guid.NewGuid());

            var addOnId = Guid.NewGuid();

            // Act
            cart.AddItem(product, 1, "Black", "M", addOnId, 1_000_000m);
            cart.AddItem(product, 2, "Black", "M", addOnId, 1_000_000m);

            // Assert
            cart.CartItems.Should().HaveCount(1);
            var item = cart.CartItems.First();
            item.Quantity.Should().Be(3);
            item.AddOnPrice.Should().Be(1_000_000m);
        }
    }
}
