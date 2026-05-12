using Ecommerce.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class CartTests
{
    [Fact]
    public void AddItem_NewProduct_AddsItemAndRecalculatesTotals()
    {
        // Arrange
        var cart = new Cart(Guid.NewGuid());
        var product = ProductTests.CreateProduct(price: 1000m, salePrice: 800m, stockQuantity: 10);

        // Act
        cart.AddItem(product, 2, "Black", "256GB");

        // Assert
        cart.CartItems.Should().ContainSingle();
        cart.Subtotal.Should().Be(1600m);
        cart.Total.Should().Be(1600m);
    }

    [Fact]
    public void AddItem_SameProductColorAndSize_MergesQuantity()
    {
        // Arrange
        var cart = new Cart(Guid.NewGuid());
        var product = ProductTests.CreateProduct(price: 1000m, salePrice: null, stockQuantity: 10);

        // Act
        cart.AddItem(product, 2, "Black", "256GB");
        cart.AddItem(product, 3, "Black", "256GB");

        // Assert
        cart.CartItems.Should().ContainSingle()
            .Which.Quantity.Should().Be(5);
        cart.Total.Should().Be(5000m);
    }

    [Fact]
    public void AddItem_QuantityExceedsStock_ThrowsException()
    {
        // Arrange
        var cart = new Cart(Guid.NewGuid());
        var product = ProductTests.CreateProduct(stockQuantity: 1);
        Action act = () => cart.AddItem(product, 2);

        // Act & Assert
        act.Should().Throw<Exception>()
            .WithMessage("Không đủ hàng trong kho. Kho còn: 1");
    }

    [Fact]
    public void UpdateQuantity_QuantityZero_RemovesItemAndRecalculatesTotal()
    {
        // Arrange
        var cart = new Cart(Guid.NewGuid());
        var product = ProductTests.CreateProduct(price: 500m, salePrice: null, stockQuantity: 10);
        cart.AddItem(product, 2);

        // Act
        cart.UpdateQuantity(product.Id, 0);

        // Assert
        cart.CartItems.Should().BeEmpty();
        cart.Total.Should().Be(0m);
    }

    [Fact]
    public void UpdateQuantity_ProductNotInCart_ThrowsException()
    {
        // Arrange
        var cart = new Cart(Guid.NewGuid());
        Action act = () => cart.UpdateQuantity(Guid.NewGuid(), 1);

        // Act & Assert
        act.Should().Throw<Exception>()
            .WithMessage("Không tìm thấy sản phẩm trong giỏ hàng*");
    }

    [Fact]
    public void ApplyPromoCode_ValidDiscount_RecalculatesTotal()
    {
        // Arrange
        var cart = new Cart("guest-1");
        cart.AddItem(ProductTests.CreateProduct(price: 1000m, salePrice: null), 2);

        // Act
        cart.ApplyPromoCode("SALE100", 100m);
        cart.SetShippingCost(30m);

        // Assert
        cart.PromoCode.Should().Be("SALE100");
        cart.Discount.Should().Be(100m);
        cart.Total.Should().Be(1930m);
    }
}
