using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class ProductAttributeTests
{
    [Fact]
    public void Create_ValidName_TrimsNameAndSetsProduct()
    {
        // Arrange
        var productId = Guid.NewGuid();

        // Act
        var attribute = Ecommerce.Domain.Entities.ProductAttribute.Create(productId, " RAM ", 1);

        // Assert
        attribute.ProductId.Should().Be(productId);
        attribute.Name.Should().Be("RAM");
        attribute.DisplayOrder.Should().Be(1);
    }

    [Fact]
    public void Create_EmptyName_ThrowsArgumentException()
    {
        // Arrange
        Action act = () => Ecommerce.Domain.Entities.ProductAttribute.Create(Guid.NewGuid(), " ", 1);

        // Act & Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Tên thuộc tính không được để trống.");
    }

    [Fact]
    public void AddValue_ValidValue_AddsTrimmedValue()
    {
        // Arrange
        var attribute = Ecommerce.Domain.Entities.ProductAttribute.Create(Guid.NewGuid(), "Color", 1);

        // Act
        var value = attribute.AddValue(" Black ", 2, "#000000", "black.png");

        // Assert
        attribute.Values.Should().ContainSingle().Which.Should().Be(value);
        value.Value.Should().Be("Black");
        value.ColorHex.Should().Be("#000000");
        value.ImageUrl.Should().Be("black.png");
    }

    [Fact]
    public void AddValue_EmptyValue_ThrowsArgumentException()
    {
        // Arrange
        var attribute = Ecommerce.Domain.Entities.ProductAttribute.Create(Guid.NewGuid(), "Color", 1);
        Action act = () => attribute.AddValue(" ", 1);

        // Act & Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Giá trị thuộc tính không được để trống.");
    }

    [Fact]
    public void ClearValues_WithExistingValues_RemovesAllValues()
    {
        // Arrange
        var attribute = Ecommerce.Domain.Entities.ProductAttribute.Create(Guid.NewGuid(), "Color", 1);
        attribute.AddValue("Black", 1);
        attribute.AddValue("White", 2);

        // Act
        attribute.ClearValues();

        // Assert
        attribute.Values.Should().BeEmpty();
    }
}
