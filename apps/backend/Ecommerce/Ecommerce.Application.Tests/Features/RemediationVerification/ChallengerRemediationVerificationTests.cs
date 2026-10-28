using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Application.Features.Promotions.Commands.CreateFlashSale;
using Ecommerce.Application.Features.Promotions.Commands.UpdateFlashSale;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Application.Features.Returns.Commands.AddReturnRequestLog;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using FluentValidation.TestHelper;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.RemediationVerification;

public class ChallengerRemediationVerificationTests
{
    // =========================================================================
    // ITEM 1: TransferShowroomStockCommand & INonTransactionalRequest
    // =========================================================================
    [Fact]
    public void TransferShowroomStockCommand_Implements_INonTransactionalRequest()
    {
        // Invariant: TransferShowroomStockCommand must implement INonTransactionalRequest
        typeof(TransferShowroomStockCommand).Should().Implement<INonTransactionalRequest>();
    }

    [Fact]
    public async Task TransactionBehavior_WhenHandling_TransferShowroomStockCommand_SkipsTransaction()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var loggerMock = new Mock<IEnhancedLogger>();
        var behavior = new TransactionBehavior<TransferShowroomStockCommand, Result<bool>>(
            unitOfWorkMock.Object,
            loggerMock.Object);

        var command = new TransferShowroomStockCommand
        {
            FromShowroomId = Guid.NewGuid(),
            ToShowroomId = Guid.NewGuid(),
            ProductId = Guid.NewGuid(),
            Quantity = 5
        };

        var nextCalled = false;
        Task<Result<bool>> Next()
        {
            nextCalled = true;
            return Task.FromResult(Result<bool>.Success(true));
        }

        // Act
        var result = await behavior.Handle(command, Next, CancellationToken.None);

        // Assert
        nextCalled.Should().BeTrue();
        result.IsSuccess.Should().BeTrue();
        // Crucial invariant: BeginTransactionAsync must NEVER be called by TransactionBehavior
        unitOfWorkMock.Verify(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
        unitOfWorkMock.Verify(u => u.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    // =========================================================================
    // ITEM 2: CreateOrderCommandHandler AddOn Warranty Duration Calculation
    // =========================================================================
    [Theory]
    [InlineData(24, 12, 36)] // Standard 24m base + 12m AddOn = 36m (previously failed: was overwritten to 12m)
    [InlineData(12, 24, 36)] // 12m base + 24m AddOn = 36m
    [InlineData(0, 12, 36)]  // 0m base (falls back to 24) + 12m AddOn = 36m
    [InlineData(36, 12, 48)] // 36m base + 12m AddOn = 48m
    public async Task CreateOrder_WithAddOn_CorrectlyAddsAddOnDurationToBaseWarranty(
        int productWarrantyMonths,
        int addOnDurationMonths,
        int expectedFinalWarrantyMonths)
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var userRepoMock = new Mock<IUserRepository>();
        var productRepoMock = new Mock<IProductRepository>();
        var orderRepoMock = new Mock<IOrderRepository>();
        var addOnRepoMock = new Mock<IRepository<ProductAddOn>>();
        var loggerMock = new Mock<IEnhancedLogger>();
        var publisherMock = new Mock<IPublisher>();
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        var orderCodeGeneratorMock = new Mock<IOrderCodeGenerator>();

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Nguyen",
            LastName = "Van A",
            Email = "test@example.com"
        };
        var product = Product.Create("P1", "Laptop Gaming", "laptop-gaming", "SKU1", 20_000_000m, null, "img.png", "desc", 10, Guid.NewGuid(), Guid.NewGuid());
        product.WarrantyMonths = productWarrantyMonths;

        var addOnId = Guid.NewGuid();
        var addOn = new ProductAddOn
        {
            Id = addOnId,
            Name = "Bảo hành mở rộng 12 tháng",
            Price = 1_500_000m,
            DurationMonths = addOnDurationMonths,
            IsActive = true
        };

        userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);
        productRepoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        productRepoMock.Setup(r => r.TryDecrementStockAsync(product.Id, 1, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        addOnRepoMock.Setup(r => r.GetByIdAsync(addOnId, It.IsAny<CancellationToken>())).ReturnsAsync(addOn);

        unitOfWorkMock.SetupGet(u => u.Users).Returns(userRepoMock.Object);
        unitOfWorkMock.SetupGet(u => u.Products).Returns(productRepoMock.Object);
        unitOfWorkMock.SetupGet(u => u.Orders).Returns(orderRepoMock.Object);
        unitOfWorkMock.Setup(u => u.BaseRepository<ProductAddOn>()).Returns(addOnRepoMock.Object);
        unitOfWorkMock.Setup(u => u.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        Order? savedOrder = null;
        orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Callback<Order, CancellationToken>((order, _) => savedOrder = order)
            .ReturnsAsync((Order order, CancellationToken _) => order);

        orderCodeGeneratorMock.Setup(g => g.Generate()).Returns("ORD-TEST-123");

        var handler = new CreateOrderCommandHandler(
            unitOfWorkMock.Object,
            loggerMock.Object,
            publisherMock.Object,
            currentUserServiceMock.Object,
            orderCodeGeneratorMock.Object);

        var command = new CreateOrderCommand
        {
            ApplicationUserId = user.Id,
            Email = "test@example.com",
            Phone = "0909000000",
            ShippingAddress = "123 Test Street",
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = product.Id,
                    Quantity = 1,
                    AddOnId = addOnId
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        savedOrder.Should().NotBeNull();
        savedOrder!.OrderItems.Should().HaveCount(1);
        savedOrder.OrderItems.First().WarrantyMonths.Should().Be(expectedFinalWarrantyMonths);
    }

    [Fact]
    public async Task CreateOrder_WithoutAddOn_UsesBaseWarrantyMonths()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var userRepoMock = new Mock<IUserRepository>();
        var productRepoMock = new Mock<IProductRepository>();
        var orderRepoMock = new Mock<IOrderRepository>();
        var loggerMock = new Mock<IEnhancedLogger>();
        var publisherMock = new Mock<IPublisher>();
        var currentUserServiceMock = new Mock<ICurrentUserService>();
        var orderCodeGeneratorMock = new Mock<IOrderCodeGenerator>();

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Tran",
            LastName = "Van B",
            Email = "test@example.com"
        };
        var product = Product.Create("P1", "Laptop Gaming", "laptop-gaming", "SKU1", 20_000_000m, null, "img.png", "desc", 10, Guid.NewGuid(), Guid.NewGuid());
        product.WarrantyMonths = 36;

        userRepoMock.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);
        productRepoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        productRepoMock.Setup(r => r.TryDecrementStockAsync(product.Id, 1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        unitOfWorkMock.SetupGet(u => u.Users).Returns(userRepoMock.Object);
        unitOfWorkMock.SetupGet(u => u.Products).Returns(productRepoMock.Object);
        unitOfWorkMock.SetupGet(u => u.Orders).Returns(orderRepoMock.Object);
        unitOfWorkMock.Setup(u => u.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        Order? savedOrder = null;
        orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Callback<Order, CancellationToken>((order, _) => savedOrder = order)
            .ReturnsAsync((Order order, CancellationToken _) => order);

        orderCodeGeneratorMock.Setup(g => g.Generate()).Returns("ORD-TEST-124");

        var handler = new CreateOrderCommandHandler(
            unitOfWorkMock.Object,
            loggerMock.Object,
            publisherMock.Object,
            currentUserServiceMock.Object,
            orderCodeGeneratorMock.Object);

        var command = new CreateOrderCommand
        {
            ApplicationUserId = user.Id,
            Email = "test@example.com",
            Phone = "0909000000",
            ShippingAddress = "123 Test Street",
            OrderItems = new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto
                {
                    ProductId = product.Id,
                    Quantity = 1,
                    AddOnId = null
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        savedOrder.Should().NotBeNull();
        savedOrder!.OrderItems.Should().HaveCount(1);
        savedOrder.OrderItems.First().WarrantyMonths.Should().Be(36);
    }

    // =========================================================================
    // ITEM 3: FlashSale Price Validation (FlashSalePrice <= OriginalPrice)
    // =========================================================================
    [Theory]
    [InlineData(1000, 2000, true)]   // FlashSalePrice < OriginalPrice -> Valid
    [InlineData(2000, 2000, true)]   // FlashSalePrice == OriginalPrice -> Valid
    [InlineData(2001, 2000, false)]  // FlashSalePrice > OriginalPrice -> Invalid
    [InlineData(5000, 2000, false)]  // FlashSalePrice >> OriginalPrice -> Invalid
    public void CreateFlashSaleCommandValidator_Enforces_FlashSalePrice_LessThanOrEqualTo_OriginalPrice(
        decimal flashSalePrice,
        decimal originalPrice,
        bool shouldBeValid)
    {
        // Arrange
        var validator = new CreateFlashSaleCommandValidator();
        var command = new CreateFlashSaleCommand
        {
            Title = "Flash Sale Weekend",
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(5),
            Items = new List<FlashSaleItemInputDto>
            {
                new FlashSaleItemInputDto
                {
                    ProductId = Guid.NewGuid(),
                    OriginalPrice = originalPrice,
                    FlashSalePrice = flashSalePrice,
                    TotalQuota = 10
                }
            }
        };

        // Act
        var result = validator.TestValidate(command);

        // Assert
        if (shouldBeValid)
        {
            result.ShouldNotHaveValidationErrorFor("Items[0].FlashSalePrice");
        }
        else
        {
            result.ShouldHaveValidationErrorFor("Items[0].FlashSalePrice")
                .WithErrorMessage("Giá Flash Sale phải nhỏ hơn hoặc bằng giá gốc.");
        }
    }

    [Theory]
    [InlineData(1000, 2000, true)]
    [InlineData(2000, 2000, true)]
    [InlineData(2001, 2000, false)]
    [InlineData(5000, 2000, false)]
    public void UpdateFlashSaleCommandValidator_Enforces_FlashSalePrice_LessThanOrEqualTo_OriginalPrice(
        decimal flashSalePrice,
        decimal originalPrice,
        bool shouldBeValid)
    {
        // Arrange
        var validator = new UpdateFlashSaleCommandValidator();
        var command = new UpdateFlashSaleCommand
        {
            Id = Guid.NewGuid(),
            Title = "Flash Sale Weekend Updated",
            StartTime = DateTime.UtcNow.AddHours(1),
            EndTime = DateTime.UtcNow.AddHours(5),
            Items = new List<FlashSaleItemInputDto>
            {
                new FlashSaleItemInputDto
                {
                    ProductId = Guid.NewGuid(),
                    OriginalPrice = originalPrice,
                    FlashSalePrice = flashSalePrice,
                    TotalQuota = 10
                }
            }
        };

        // Act
        var result = validator.TestValidate(command);

        // Assert
        if (shouldBeValid)
        {
            result.ShouldNotHaveValidationErrorFor("Items[0].FlashSalePrice");
        }
        else
        {
            result.ShouldHaveValidationErrorFor("Items[0].FlashSalePrice")
                .WithErrorMessage("Giá Flash Sale phải nhỏ hơn hoặc bằng giá gốc.");
        }
    }

    // =========================================================================
    // ITEM 4: AddReturnRequestLogCommandHandler CompleteAsync and Warning Log
    // =========================================================================
    [Fact]
    public async Task AddReturnRequestLogCommandHandler_CallsCompleteAsync_OnSuccess()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var loggerMock = new Mock<IEnhancedLogger>();
        var returnRequestRepoMock = new Mock<IReturnRequestRepository>();

        var returnRequestId = Guid.NewGuid();
        var returnRequest = ReturnRequest.Create(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            EReturnType.Return,
            EReturnReason.Defective,
            "Defective item",
            1,
            500_000m,
            "RMA-001");
        returnRequest.Id = returnRequestId;

        returnRequestRepoMock
            .Setup(r => r.GetWithDetailsAsync(returnRequestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(returnRequest);

        unitOfWorkMock.SetupGet(u => u.ReturnRequests).Returns(returnRequestRepoMock.Object);
        unitOfWorkMock.Setup(u => u.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new AddReturnRequestLogCommandHandler(unitOfWorkMock.Object, loggerMock.Object);

        var command = new AddReturnRequestLogCommand
        {
            ReturnRequestId = returnRequestId,
            Step = 2,
            Action = "ItemReceived",
            Title = "Nhận máy tại Showroom",
            ActorName = "KTV Nguyễn Văn A",
            Note = "Máy trầy xước nhẹ"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        unitOfWorkMock.Verify(u => u.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        returnRequest.Logs.Should().HaveCount(1);
        returnRequest.Logs.First().ActorName.Should().Be("KTV Nguyễn Văn A");
    }

    [Fact]
    public async Task AddReturnRequestLogCommandHandler_LogsWarning_WhenStateTransitionThrows()
    {
        // Arrange
        var unitOfWorkMock = new Mock<IUnitOfWork>();
        var loggerMock = new Mock<IEnhancedLogger>();
        var returnRequestRepoMock = new Mock<IReturnRequestRepository>();

        var returnRequestId = Guid.NewGuid();
        // A newly created return request is in Submitted status. Calling MarkCompleted directly throws DomainException.
        var returnRequest = ReturnRequest.Create(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            EReturnType.Return,
            EReturnReason.Defective,
            "Defective item",
            1,
            500_000m,
            "RMA-002");
        returnRequest.Id = returnRequestId;

        returnRequestRepoMock
            .Setup(r => r.GetWithDetailsAsync(returnRequestId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(returnRequest);

        unitOfWorkMock.SetupGet(u => u.ReturnRequests).Returns(returnRequestRepoMock.Object);
        unitOfWorkMock.Setup(u => u.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var handler = new AddReturnRequestLogCommandHandler(unitOfWorkMock.Object, loggerMock.Object);

        var command = new AddReturnRequestLogCommand
        {
            ReturnRequestId = returnRequestId,
            AdvanceStatus = EReturnStatus.Completed, // Cannot transition directly from Submitted to Completed -> Throws DomainException
            Step = 5,
            Action = "Completed",
            Title = "Hoàn tất RMA",
            ActorName = "KTV Test",
            Note = "Thử hoàn tất trực tiếp khi chưa qua kiểm tra"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        // Invariant: _logger.Log(ELogLevel.Warning, ...) must be invoked with RMA message
        loggerMock.Verify(l => l.Log(
            ELogLevel.Warning,
            It.Is<string>(msg => msg.Contains("Không thể tự động chuyển trạng thái RMA")),
            "AddReturnRequestLog",
            null), Times.Once);

        // Invariant: CompleteAsync must still be called to persist the audit log
        unitOfWorkMock.Verify(u => u.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
