using Ecommerce.Domain.Exceptions;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class ProductVariantSkuTests
{
    [Fact]
    public void Create_ValidArguments_NormalizesSkuAndSetsEffectivePrice()
    {
        // Act
        var sku = Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), " phone-black ", 1000m, 900m, 5, "BAR");

        // Assert
        sku.Sku.Should().Be("PHONE-BLACK");
        sku.Price.Should().Be(1000m);
        sku.SalePrice.Should().Be(900m);
        sku.EffectivePrice.Should().Be(900m);
        sku.StockQuantity.Should().Be(5);
        sku.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_NegativeStock_ThrowsDomainException()
    {
        // Arrange
        Action act = () => Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), "SKU", 1000m, null, -1);

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Tồn kho không được âm.");
    }

    [Fact]
    public void ReserveStock_AvailableQuantity_DecreasesStock()
    {
        // Arrange
        var sku = Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), "SKU", 1000m, null, 5);

        // Act
        sku.ReserveStock(3);

        // Assert
        sku.StockQuantity.Should().Be(2);
    }

    [Fact]
    public void ReserveStock_QuantityExceedsStock_ThrowsDomainException()
    {
        // Arrange
        var sku = Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), "SKU", 1000m, null, 2);
        Action act = () => sku.ReserveStock(3);

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Không đủ tồn kho cho SKU SKU*");
    }

    [Fact]
    public void AddAttributeValue_DuplicateAttributeValue_AddsOnlyOnce()
    {
        // Arrange
        var sku = Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), "SKU", 1000m, null, 2);
        var attributeValueId = Guid.NewGuid();

        // Act
        sku.AddAttributeValue(attributeValueId);
        sku.AddAttributeValue(attributeValueId);

        // Assert
        sku.AttributeValues.Should().ContainSingle()
            .Which.ProductAttributeValueId.Should().Be(attributeValueId);
    }

    [Fact]
    public void UpdateInfo_SalePriceGreaterThanOrEqualPrice_ThrowsDomainException()
    {
        // Arrange
        var sku = Ecommerce.Domain.Entities.ProductVariantSku.Create(Guid.NewGuid(), "SKU", 1000m, null, 2);
        Action act = () => sku.UpdateInfo("SKU-2", 1000m, 1000m, null, true);

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Giá khuyến mãi phải nhỏ hơn giá gốc.");
    }
}
