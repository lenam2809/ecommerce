using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Exceptions;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class OrderTests
{
    [Fact]
    public void Create_ValidUserOrder_CreatesPendingOrder()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var order = CreateOrder(userId);

        // Assert
        order.ApplicationUserId.Should().Be(userId);
        order.IsGuestOrder.Should().BeFalse();
        order.Status.Should().Be(EOrderStatus.Pending);
        order.Code.Should().StartWith("ORD-");
        order.ExpectedDeliveryDate.Should().NotBeNull();
    }

    [Fact]
    public void CreateGuestOrder_ValidGuestData_CreatesGuestOrder()
    {
        // Act
        var order = Order.CreateGuestOrder(
            "guest@test.com",
            "Guest User",
            "0909000000",
            "123 Test Street",
            null,
            null,
            null,
            "guest-1");

        // Assert
        order.IsGuestOrder.Should().BeTrue();
        order.GuestEmail.Should().Be("guest@test.com");
        order.GuestName.Should().Be("Guest User");
        order.Email.Should().Be("guest@test.com");
    }

    [Fact]
    public void AddOrderItem_SameProductColorAndSize_MergesQuantityAndRecalculatesTotal()
    {
        // Arrange
        var order = CreateOrder();
        var productId = Guid.NewGuid();

        // Act
        order.AddOrderItem(productId, "Phone", "image.png", 1000m, 1, "Black", "256GB");
        order.AddOrderItem(productId, "Phone", "image.png", 1000m, 2, "Black", "256GB");

        // Assert
        order.OrderItems.Should().ContainSingle()
            .Which.Quantity.Should().Be(3);
        order.TotalAmount.Should().Be(3000m);
    }

    [Fact]
    public void FinalizeCreation_OrderWithoutItems_ThrowsDomainException()
    {
        // Arrange
        var order = CreateOrder();
        Action act = () => order.FinalizeCreation("Customer");

        // Act & Assert
        act.Should().Throw<DomainException>()
            .WithMessage("Đơn hàng phải có ít nhất một sản phẩm.");
    }

    [Fact]
    public void FinalizeCreation_OrderWithItems_AddsOrderCreatedEvent()
    {
        // Arrange
        var order = CreateOrder();
        order.AddOrderItem(Guid.NewGuid(), "Phone", "image.png", 1000m, 2, null, null);

        // Act
        order.FinalizeCreation("Customer");

        // Assert
        var domainEvent = order.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrderCreatedEvent>().Subject;
        domainEvent.TotalAmount.Should().Be(2000m);
        domainEvent.ItemCount.Should().Be(1);
    }

    [Fact]
    public void UpdateStatus_ValidTransition_UpdatesStatusAndAddsEvent()
    {
        // Arrange
        var order = CreateOrder();

        // Act
        order.UpdateStatus(EOrderStatus.Processing);

        // Assert
        order.Status.Should().Be(EOrderStatus.Processing);
        order.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<OrderStatusChangedEvent>();
    }

    [Fact]
    public void UpdateStatus_InvalidTransition_ThrowsInvalidStatusTransitionException()
    {
        // Arrange
        var order = CreateOrder();
        Action act = () => order.UpdateStatus(EOrderStatus.Completed);

        // Act & Assert
        act.Should().Throw<InvalidStatusTransitionException>();
    }

    internal static Order CreateOrder(Guid? userId = null)
    {
        return Order.Create(
            userId ?? Guid.NewGuid(),
            "Customer",
            "customer@test.com",
            "0909000000",
            "123 Test Street",
            null,
            null,
            null);
    }
}
