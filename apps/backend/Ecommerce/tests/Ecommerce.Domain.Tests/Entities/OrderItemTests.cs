using Ecommerce.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class OrderItemTests
{
    [Fact]
    public void Constructor_ValidArguments_SetsSnapshotValues()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        // Act
        var item = new OrderItem(orderId, productId, "Phone", "image.png", 1000m, 2, null, null);

        // Assert
        item.OrderId.Should().Be(orderId);
        item.ProductId.Should().Be(productId);
        item.Name.Should().Be("Phone");
        item.UnitPrice.Should().Be(1000m);
        item.Quantity.Should().Be(2);
        item.Color.Should().BeEmpty();
        item.Size.Should().BeEmpty();
    }

    [Fact]
    public void AddQuantity_PositiveQuantity_IncreasesQuantity()
    {
        // Arrange
        var item = new OrderItem(Guid.NewGuid(), Guid.NewGuid(), "Phone", "image.png", 1000m, 2, "Black", "256GB");

        // Act
        item.AddQuantity(3);

        // Assert
        item.Quantity.Should().Be(5);
    }
}
