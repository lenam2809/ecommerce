using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Exceptions;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class InventoryItemTests
{
    [Fact]
    public void Create_ValidSerialNumber_CreatesAvailableInventoryItem()
    {
        // Arrange
        var skuId = Guid.NewGuid();

        // Act
        var item = InventoryItem.Create(skuId, " IMEI-001 ", "BATCH-1");

        // Assert
        item.ProductVariantSkuId.Should().Be(skuId);
        item.SerialNumber.Should().Be("IMEI-001");
        item.BatchCode.Should().Be("BATCH-1");
        item.Status.Should().Be(EInventoryStatus.Available);
    }

    [Fact]
    public void Create_EmptySerialNumber_ThrowsDomainException()
    {
        // Arrange
        Action act = () => InventoryItem.Create(Guid.NewGuid(), " ");

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("IMEI/Serial Number không được để trống.");
    }

    [Fact]
    public void Reserve_AvailableItem_MarksReservedAndAssignsOrderItem()
    {
        // Arrange
        var item = InventoryItem.Create(Guid.NewGuid(), "IMEI-001");
        var orderItemId = Guid.NewGuid();

        // Act
        item.Reserve(orderItemId);

        // Assert
        item.Status.Should().Be(EInventoryStatus.Reserved);
        item.OrderItemId.Should().Be(orderItemId);
    }

    [Fact]
    public void ConfirmSold_ReservedItem_MarksSold()
    {
        // Arrange
        var item = InventoryItem.Create(Guid.NewGuid(), "IMEI-001");
        item.Reserve(Guid.NewGuid());

        // Act
        item.ConfirmSold();

        // Assert
        item.Status.Should().Be(EInventoryStatus.Sold);
    }

    [Fact]
    public void ConfirmSold_ItemNotReserved_ThrowsDomainException()
    {
        // Arrange
        var item = InventoryItem.Create(Guid.NewGuid(), "IMEI-001");
        Action act = () => item.ConfirmSold();

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("IMEI/Serial IMEI-001 chưa được reserve.");
    }

    [Fact]
    public void Release_ReservedItem_ReturnsToAvailableAndClearsOrderItem()
    {
        // Arrange
        var item = InventoryItem.Create(Guid.NewGuid(), "IMEI-001");
        item.Reserve(Guid.NewGuid());

        // Act
        item.Release();

        // Assert
        item.Status.Should().Be(EInventoryStatus.Available);
        item.OrderItemId.Should().BeNull();
    }
}
