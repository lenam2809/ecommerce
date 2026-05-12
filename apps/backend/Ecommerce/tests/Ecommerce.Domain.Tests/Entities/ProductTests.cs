using Ecommerce.Domain.Entities;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class ProductTests
{
    [Fact]
    public void Create_ValidArguments_CreatesActiveProduct()
    {
        // Arrange
        var categoryId = Guid.NewGuid();
        var brandId = Guid.NewGuid();

        // Act
        var product = CreateProduct(categoryId: categoryId, brandId: brandId);

        // Assert
        product.Code.Should().Be("P001");
        product.Name.Should().Be("Phone");
        product.Price.Should().Be(1000m);
        product.SalePrice.Should().Be(900m);
        product.StockQuantity.Should().Be(10);
        product.CategoryId.Should().Be(categoryId);
        product.BrandId.Should().Be(brandId);
        product.IsActive.Should().BeTrue();
        product.HasVariants.Should().BeFalse();
    }

    [Fact]
    public void Create_SalePriceGreaterThanOrEqualPrice_ThrowsArgumentException()
    {
        // Arrange
        Action act = () => CreateProduct(price: 1000m, salePrice: 1000m);

        // Act & Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Sale price must be less than regular price.");
    }

    [Fact]
    public void UpdatePrice_ValidPrice_UpdatesPriceValues()
    {
        // Arrange
        var product = CreateProduct();

        // Act
        product.UpdatePrice(1200m, 1100m);

        // Assert
        product.Price.Should().Be(1200m);
        product.SalePrice.Should().Be(1100m);
    }

    [Fact]
    public void UpdatePrice_NegativeSalePrice_ThrowsArgumentException()
    {
        // Arrange
        var product = CreateProduct();
        Action act = () => product.UpdatePrice(1200m, -1m);

        // Act & Assert
        act.Should().Throw<ArgumentException>()
            .WithMessage("Sale price cannot be negative.");
    }

    [Fact]
    public void AdjustStock_PositiveAndNegativeAdjustments_UpdatesStockQuantity()
    {
        // Arrange
        var product = CreateProduct(stockQuantity: 10);

        // Act
        product.AdjustStock(5);
        product.AdjustStock(-3);

        // Assert
        product.StockQuantity.Should().Be(12);
    }

    [Fact]
    public void AdjustStock_AdjustmentBelowZero_ThrowsInvalidOperationException()
    {
        // Arrange
        var product = CreateProduct(stockQuantity: 2);
        Action act = () => product.AdjustStock(-3);

        // Act & Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Insufficient stock for product Phone*");
    }

    [Fact]
    public void AddImage_DuplicateUrl_AddsImageOnlyOnce()
    {
        // Arrange
        var product = CreateProduct();

        // Act
        product.AddImage("https://cdn.test/phone.png");
        product.AddImage("https://cdn.test/phone.png");

        // Assert
        product.Images.Should().ContainSingle()
            .Which.Url.Should().Be("https://cdn.test/phone.png");
    }

    [Fact]
    public void EnableVariants_WithVariantSkus_UsesActiveSkuStockAndPriceRange()
    {
        // Arrange
        var product = CreateProduct(price: 1000m, salePrice: null, stockQuantity: 7);

        // Act
        product.EnableVariants();
        product.AddVariantSku("phone-red", 1200m, 1000m, 3);
        product.AddVariantSku("phone-blue", 1500m, null, 5);

        // Assert
        product.GetTotalStock().Should().Be(8);
        product.GetPriceRange().Should().Be((1000m, 1500m));
    }

    internal static Product CreateProduct(
        decimal price = 1000m,
        decimal? salePrice = 900m,
        int stockQuantity = 10,
        Guid? categoryId = null,
        Guid? brandId = null)
    {
        return Product.Create(
            "P001",
            "Phone",
            "phone",
            "PHONE-001",
            price,
            salePrice,
            "https://cdn.test/phone.png",
            "A test phone",
            stockQuantity,
            categoryId ?? Guid.NewGuid(),
            brandId ?? Guid.NewGuid());
    }
}
