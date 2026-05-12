using Ecommerce.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class ProductAttributeValueTests
{
    [Fact]
    public void Constructor_ValidArguments_SetsAttributeValueData()
    {
        // Arrange
        var attributeId = Guid.NewGuid();

        // Act
        var value = new ProductAttributeValue(attributeId, "256GB", 1, null, "storage.png");

        // Assert
        value.ProductAttributeId.Should().Be(attributeId);
        value.Value.Should().Be("256GB");
        value.DisplayOrder.Should().Be(1);
        value.ImageUrl.Should().Be("storage.png");
    }

    [Fact]
    public void Update_ValidArguments_UpdatesValueMetadata()
    {
        // Arrange
        var value = new ProductAttributeValue(Guid.NewGuid(), "Black", 1, "#000", null);

        // Act
        value.Update("White", 2, "#fff", "white.png");

        // Assert
        value.Value.Should().Be("White");
        value.DisplayOrder.Should().Be(2);
        value.ColorHex.Should().Be("#fff");
        value.ImageUrl.Should().Be("white.png");
    }
}
