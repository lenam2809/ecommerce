using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Commands.CreateReturnRequest;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Returns.Commands.CreateReturnRequest;

public class CreateReturnRequestCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IReturnRequestRepository> _returnRequestRepository = new();
    private readonly Mock<IOrderHistoryRepository> _orderHistoryRepository = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly Mock<IRmaCodeGenerator> _rmaCodeGenerator = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly CreateReturnRequestCommandHandler _handler;

    public CreateReturnRequestCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Orders).Returns(_orderRepository.Object);
        _unitOfWork.SetupGet(x => x.ReturnRequests).Returns(_returnRequestRepository.Object);
        _unitOfWork.SetupGet(x => x.OrderHistories).Returns(_orderHistoryRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _rmaCodeGenerator.Setup(x => x.Generate()).Returns(() => $"RMA-{Guid.NewGuid():N}"[..20]);

        _handler = new CreateReturnRequestCommandHandler(
            _unitOfWork.Object,
            _logger.Object,
            _rmaCodeGenerator.Object,
            _currentUserService.Object);
    }

    [Fact]
    public async Task Handle_OpenReturnExistsForOrderItem_ReturnsConflict()
    {
        var userId = Guid.NewGuid();
        var (order, orderItem) = CreateDeliveredOrder(userId, quantity: 2);
        SetupValidOrder(userId, order);
        _returnRequestRepository
            .Setup(x => x.HasOpenReturnForOrderItemAsync(orderItem.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _handler.Handle(CreateCommand(order.Id, orderItem.Id, quantity: 1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Conflict);
        _returnRequestRepository.Verify(x => x.AddAsync(It.IsAny<ReturnRequest>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_QuantityExceedsRemainingReturnableQuantity_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var (order, orderItem) = CreateDeliveredOrder(userId, quantity: 2);
        SetupValidOrder(userId, order);
        _returnRequestRepository
            .Setup(x => x.GetNonRejectedQuantityByOrderItemAsync(orderItem.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var result = await _handler.Handle(CreateCommand(order.Id, orderItem.Id, quantity: 2), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Số lượng đổi/trả không hợp lệ. Tối đa còn lại: 1.");
    }

    [Fact]
    public async Task Handle_ReturnAfterWindow_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var (order, orderItem) = CreateDeliveredOrder(userId, quantity: 1);
        SetupValidOrder(userId, order, deliveredAt: DateTime.UtcNow.AddDays(-8));

        var result = await _handler.Handle(CreateCommand(order.Id, orderItem.Id, quantity: 1), CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Đã quá hạn đổi/trả 7 ngày kể từ ngày nhận hàng.");
    }

    [Fact]
    public async Task Handle_ExternalEvidenceUrl_ReturnsBadRequest()
    {
        var userId = Guid.NewGuid();
        var (order, orderItem) = CreateDeliveredOrder(userId, quantity: 1);
        SetupValidOrder(userId, order);
        var command = CreateCommand(order.Id, orderItem.Id, quantity: 1);
        command.EvidenceFiles.Add(new EvidenceFileInput
        {
            FileUrl = "https://evil.example/evidence.png",
            FileType = EEvidenceType.Image
        });

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("File bằng chứng phải là đường dẫn storage nội bộ, không chấp nhận URL bên ngoài.");
    }

    [Fact]
    public async Task Handle_ValidReturnRequest_PersistsReturnWithEvidence()
    {
        var userId = Guid.NewGuid();
        var (order, orderItem) = CreateDeliveredOrder(userId, quantity: 2);
        ReturnRequest? capturedReturn = null;
        SetupValidOrder(userId, order);
        _returnRequestRepository
            .Setup(x => x.AddAsync(It.IsAny<ReturnRequest>(), It.IsAny<CancellationToken>()))
            .Callback<ReturnRequest, CancellationToken>((request, _) => capturedReturn = request)
            .ReturnsAsync((ReturnRequest request, CancellationToken _) => request);
        var command = CreateCommand(order.Id, orderItem.Id, quantity: 1);
        command.EvidenceFiles.Add(new EvidenceFileInput
        {
            FileUrl = "returns/damage-photo.png",
            FileType = EEvidenceType.Image,
            Description = "Damaged item"
        });

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        capturedReturn.Should().NotBeNull();
        capturedReturn!.Quantity.Should().Be(1);
        capturedReturn.RefundAmount.Should().Be(orderItem.UnitPrice);
        capturedReturn.Evidences.Should().ContainSingle()
            .Which.FileUrl.Should().Be("returns/damage-photo.png");
    }

    private void SetupValidOrder(Guid userId, Order order, DateTime? deliveredAt = null)
    {
        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _orderRepository
            .Setup(x => x.GetOrderWithItemsAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);
        _orderHistoryRepository
            .Setup(x => x.GetByOrderIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[]
            {
                new OrderHistory
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    FromStatus = EOrderStatus.Shipped,
                    ToStatus = EOrderStatus.Delivered,
                    ChangedBy = "test",
                    ChangeSource = "test",
                    ChangedAt = deliveredAt ?? DateTime.UtcNow.AddDays(-1)
                }
            });
    }

    private static CreateReturnRequestCommand CreateCommand(Guid orderId, Guid orderItemId, int quantity)
    {
        return new CreateReturnRequestCommand
        {
            OrderId = orderId,
            OrderItemId = orderItemId,
            CustomerId = Guid.NewGuid(),
            Type = EReturnType.Return,
            Reason = EReturnReason.Defective,
            CustomerNote = "Product is defective",
            Quantity = quantity
        };
    }

    private static (Order Order, OrderItem OrderItem) CreateDeliveredOrder(Guid userId, int quantity)
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

        order.AddOrderItem(Guid.NewGuid(), "Phone", "phone.png", 100000m, quantity, null, null);
        order.UpdateStatus(EOrderStatus.Processing);
        order.UpdateStatus(EOrderStatus.Shipped);
        order.UpdateStatus(EOrderStatus.Delivered);
        return (order, order.OrderItems.Single());
    }
}
