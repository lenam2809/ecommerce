using Ecommerce.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class CartItemTests
{
    [Fact]
    public void Constructor_ValidQuantity_SetsProductAndVariantData()
    {
        // Arrange
        var product = ProductTests.CreateProduct(price: 1000m, salePrice: 750m, stockQuantity: 3);
        var cartId = Guid.NewGuid();

        // Act
        var item = new CartItem(cartId, product, 2, "Black", "256GB");

        // Assert
        item.CartId.Should().Be(cartId);
        item.ProductId.Should().Be(product.Id);
        item.Quantity.Should().Be(2);
        item.TotalPrice.Should().Be(1500m);
    }

    [Fact]
    public void Constructor_InvalidQuantity_ThrowsException()
    {
        // Arrange
        var product = ProductTests.CreateProduct(stockQuantity: 3);
        Action act = () => new CartItem(Guid.NewGuid(), product, 0, null, null);

        // Act & Assert
        act.Should().Throw<Exception>()
            .WithMessage("Không đủ hàng trong kho. Kho còn: 3");
    }

    [Fact]
    public void UpdateQuantity_ValidQuantity_UpdatesQuantityAndTotalPrice()
    {
        // Arrange
        var product = ProductTests.CreateProduct(price: 1000m, salePrice: null, stockQuantity: 10);
        var item = new CartItem(Guid.NewGuid(), product, 2, null, null);

        // Act
        item.UpdateQuantity(4);

        // Assert
        item.Quantity.Should().Be(4);
        item.TotalPrice.Should().Be(4000m);
    }
}
