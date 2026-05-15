using System.Linq.Expressions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Payments.Commands.CreatePaymentForOrder;
using Ecommerce.Application.Features.Payments.VnPay;
using Ecommerce.Application.Features.Payments.VnPay.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Payments.Commands.CreatePaymentForOrder;

public class CreatePaymentForOrderCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IRepository<Payment>> _paymentRepository = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly Mock<IVnPayService> _vnPayService = new();
    private readonly CreatePaymentForOrderCommandHandler _handler;

    public CreatePaymentForOrderCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Orders).Returns(_orderRepository.Object);
        _unitOfWork.Setup(x => x.BaseRepository<Payment>()).Returns(_paymentRepository.Object);
        _paymentRepository
            .Setup(x => x.AnyAsync(It.IsAny<Expression<Func<Payment, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _handler = new CreatePaymentForOrderCommandHandler(
            _unitOfWork.Object,
            _currentUserService.Object,
            _vnPayService.Object);
    }

    [Fact]
    public async Task Handle_UserCreatesPaymentForOwnPendingOrder_UsesServerDerivedAmount()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var order = CreateOrder(userId, unitPrice: 125000m, quantity: 2);
        PaymentInformationModel? capturedPaymentInfo = null;

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _orderRepository
            .Setup(x => x.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        _vnPayService
            .Setup(x => x.CreatePaymentUrl(It.IsAny<PaymentInformationModel>(), "10.0.0.1"))
            .Callback<PaymentInformationModel, string>((model, _) => capturedPaymentInfo = model)
            .Returns("https://vnpay.test/payment?vnp_Amount=25000000");

        // Act
        var result = await _handler.Handle(new CreatePaymentForOrderCommand
        {
            OrderId = order.Id,
            ClientIpAddress = "10.0.0.1"
        }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Amount.Should().Be(250000m);
        result.Value.OrderId.Should().Be(order.Id);
        result.Value.TransactionRef.Should().Be(order.Id.ToString("D"));
        result.Value.PaymentUrl.Should().Be("https://vnpay.test/payment?vnp_Amount=25000000");

        capturedPaymentInfo.Should().NotBeNull();
        capturedPaymentInfo!.OrderId.Should().Be(order.Id.ToString("D"));
        capturedPaymentInfo.Amount.Should().Be(250000d);
        capturedPaymentInfo.OrderDescription.Should().Contain(order.Code);
    }

    [Fact]
    public async Task Handle_UserCreatesPaymentForAnotherUsersOrder_ReturnsForbidden()
    {
        // Arrange
        var orderOwnerId = Guid.NewGuid();
        var currentUserId = Guid.NewGuid();
        var order = CreateOrder(orderOwnerId);

        _currentUserService.SetupGet(x => x.UserId).Returns(currentUserId);
        _orderRepository
            .Setup(x => x.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _handler.Handle(new CreatePaymentForOrderCommand { OrderId = order.Id }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Forbidden);
        _vnPayService.Verify(x => x.CreatePaymentUrl(It.IsAny<PaymentInformationModel>(), It.IsAny<string>()), Times.Never);
    }

    [Theory]
    [InlineData(EOrderStatus.Processing)]
    [InlineData(EOrderStatus.Cancelled)]
    public async Task Handle_OrderNotInPayableState_ReturnsBadRequest(EOrderStatus status)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var order = CreateOrder(userId);
        order.UpdateStatus(status, "test");

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _orderRepository
            .Setup(x => x.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _handler.Handle(new CreatePaymentForOrderCommand { OrderId = order.Id }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Đơn hàng hiện không ở trạng thái có thể thanh toán.");
        _vnPayService.Verify(x => x.CreatePaymentUrl(It.IsAny<PaymentInformationModel>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_GuestOrder_ReturnsForbidden()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var order = CreateGuestOrder();

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _orderRepository
            .Setup(x => x.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _handler.Handle(new CreatePaymentForOrderCommand { OrderId = order.Id }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Forbidden);
        result.Error.Should().Be("Thanh toán VNPay cho guest order chưa được hỗ trợ an toàn.");
    }

    [Fact]
    public async Task Handle_OrderAlreadyHasSuccessfulPayment_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var order = CreateOrder(userId);

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _orderRepository
            .Setup(x => x.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        _paymentRepository
            .Setup(x => x.AnyAsync(It.IsAny<Expression<Func<Payment, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _handler.Handle(new CreatePaymentForOrderCommand { OrderId = order.Id }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Đơn hàng đã được thanh toán.");
        _vnPayService.Verify(x => x.CreatePaymentUrl(It.IsAny<PaymentInformationModel>(), It.IsAny<string>()), Times.Never);
    }

    private static Order CreateOrder(Guid userId, decimal unitPrice = 100000m, int quantity = 1)
    {
        var order = Order.Create(
            userId,
            "Test User",
            "customer@example.com",
            "0909000000",
            "123 Test Street",
            null,
            null,
            null);

        order.AddOrderItem(Guid.NewGuid(), "Phone", "phone.png", unitPrice, quantity, null, null);
        return order;
    }

    private static Order CreateGuestOrder()
    {
        var order = Order.CreateGuestOrder(
            "guest@example.com",
            "Guest User",
            "0909000000",
            "123 Test Street",
            null,
            null,
            null,
            "guest-1");

        order.AddOrderItem(Guid.NewGuid(), "Phone", "phone.png", 100000m, 1, null, null);
        return order;
    }
}
