using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Base;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IProductVariantSkuRepository> _productVariantSkuRepository = new();
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IPromoCodeRepository> _promoCodeRepository = new();
    private readonly Mock<IRepository<Product>> _baseProductRepository = new();
    private readonly Mock<IRepository<PromoCode>> _basePromoCodeRepository = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly Mock<IPublisher> _publisher = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly CreateOrderCommandHandler _handler;

    public CreateOrderCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Users).Returns(_userRepository.Object);
        _unitOfWork.SetupGet(x => x.Products).Returns(_productRepository.Object);
        _unitOfWork.SetupGet(x => x.ProductVariantSkus).Returns(_productVariantSkuRepository.Object);
        _unitOfWork.SetupGet(x => x.Orders).Returns(_orderRepository.Object);
        _unitOfWork.SetupGet(x => x.PromoCodes).Returns(_promoCodeRepository.Object);
        _unitOfWork.Setup(x => x.BaseRepository<Product>()).Returns(_baseProductRepository.Object);
        _unitOfWork.Setup(x => x.BaseRepository<PromoCode>()).Returns(_basePromoCodeRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _productRepository
            .Setup(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _productVariantSkuRepository
            .Setup(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _basePromoCodeRepository
            .Setup(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _orderRepository
            .Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order order, CancellationToken _) => order);

        _handler = new CreateOrderCommandHandler(
            _unitOfWork.Object,
            _logger.Object,
            _publisher.Object,
            _currentUserService.Object);
    }

    [Fact]
    public async Task Handle_ValidPromoCode_AppliesDiscountAndIncrementsUsageOnce()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 5, price: 1000m, salePrice: 900m);
        var promoCode = CreatePromoCode("SAVE10", PromoCodeType.PercentageDiscount, discountPercentage: 10m);
        var command = CreateCommand(user.Id, product.Id, quantity: 2);
        command.DiscountCode = promoCode.Code;
        Order? capturedOrder = null;

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _promoCodeRepository.Setup(x => x.GetByCodeAsync(promoCode.Code))
            .ReturnsAsync(promoCode);
        _orderRepository
            .Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Callback<Order, CancellationToken>((order, _) => capturedOrder = order)
            .ReturnsAsync((Order order, CancellationToken _) => order);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedOrder.Should().NotBeNull();
        capturedOrder!.DiscountCode.Should().Be("SAVE10");
        capturedOrder.TotalAmount.Should().Be(1620m);

        _basePromoCodeRepository.Verify(x => x.ExecuteCommandAsync(
            It.Is<string>(sql => sql.Contains("UPDATE \"PromoCodes\"") && sql.Contains("\"TimesUsed\" = \"TimesUsed\" + 1")),
            It.Is<object[]?>(parameters => parameters != null && (string)parameters[0] == promoCode.Code),
            It.IsAny<CancellationToken>()), Times.Once);
        _productRepository.Verify(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PromoUsageLimitReached_ReturnsBadRequestWithoutStockDeduction()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 5);
        var promoCode = CreatePromoCode("LIMITED", PromoCodeType.FixedAmountDiscount, discountAmount: 100m, usageLimit: 1, timesUsed: 1);
        var command = CreateCommand(user.Id, product.Id, quantity: 1);
        command.DiscountCode = promoCode.Code;

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _promoCodeRepository.Setup(x => x.GetByCodeAsync(promoCode.Code))
            .ReturnsAsync(promoCode);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Mã giảm giá đã đạt giới hạn sử dụng");

        _basePromoCodeRepository.Verify(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()), Times.Never);
        _productRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PromoRedeemRaceFails_RestoresStockAndDoesNotPersistOrder()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 5);
        var promoCode = CreatePromoCode("RACE", PromoCodeType.FixedAmountDiscount, discountAmount: 100m, usageLimit: 1, timesUsed: 0);
        var command = CreateCommand(user.Id, product.Id, quantity: 2);
        command.DiscountCode = promoCode.Code;

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _promoCodeRepository.Setup(x => x.GetByCodeAsync(promoCode.Code))
            .ReturnsAsync(promoCode);
        _basePromoCodeRepository
            .Setup(x => x.ExecuteCommandAsync(It.IsAny<string>(), It.IsAny<object[]?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Mã giảm giá không hợp lệ hoặc đã đạt giới hạn sử dụng");

        _productRepository.Verify(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);
        _productRepository.Verify(x => x.RestoreStockAsync(product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ValidAuthenticatedOrder_ReturnsSuccessAndPersistsOrder()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 5, price: 1000m, salePrice: 900m);
        var command = CreateCommand(user.Id, product.Id, quantity: 2);
        Order? capturedOrder = null;

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _orderRepository
            .Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Callback<Order, CancellationToken>((order, _) => capturedOrder = order)
            .ReturnsAsync((Order order, CancellationToken _) => order);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(capturedOrder!.Id);

        capturedOrder.Should().NotBeNull();
        capturedOrder!.ApplicationUserId.Should().Be(user.Id);
        capturedOrder.TotalAmount.Should().Be(1800m);
        capturedOrder.OrderItems.Should().ContainSingle(item =>
            item.ProductId == product.Id &&
            item.Quantity == 2 &&
            item.UnitPrice == 900m);
        capturedOrder.DomainEvents.Should().ContainSingle();

        _productRepository.Verify(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        _logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            "Order created successfully for {OrderId} with code {OrderCode}",
            "CreateOrder",
            It.IsAny<ELogType>(),
            It.IsAny<Dictionary<string, object?>?>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CustomerNotFound_ReturnsBadRequest()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = CreateCommand(userId, Guid.NewGuid(), quantity: 1);
        _userRepository.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Khong tim thay khach hang");

        _productRepository.Verify(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var productId = Guid.NewGuid();
        var command = CreateCommand(user.Id, productId, quantity: 1);
        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(productId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Khong tim thay san pham voi ID {productId}");

        _productRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_QuantityExceedsStock_ReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 1);
        var command = CreateCommand(user.Id, product.Id, quantity: 2);
        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Khong du hang trong kho cho san pham: {product.Name}");

        _productRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_AtomicStockUpdateAffectsNoRows_ReturnsBadRequestAndClearsTracking()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateProduct(stockQuantity: 5);
        var command = CreateCommand(user.Id, product.Id, quantity: 2);
        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _productRepository
            .Setup(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Không đủ hàng trong kho cho sản phẩm: {product.Name}");

        _unitOfWork.Verify(x => x.ClearTracking(), Times.Once);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductWithVariantsMissingSku_ReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateVariantProduct(stockQuantity: 0);
        var command = CreateCommand(user.Id, product.Id, quantity: 1);

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Sản phẩm {product.Name} yêu cầu chọn SKU biến thể");

        _productRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _productVariantSkuRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductWithVariantsSkuNotBelongingToProduct_ReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateVariantProduct(stockQuantity: 0);
        var sku = CreateSku(Guid.NewGuid(), stockQuantity: 5);
        var command = CreateCommand(user.Id, product.Id, quantity: 1, productVariantSkuId: sku.Id);

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _productVariantSkuRepository.Setup(x => x.GetByIdAsync(sku.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sku);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"SKU biến thể không hợp lệ cho sản phẩm: {product.Name}");

        _productVariantSkuRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductWithVariantsInsufficientSkuStock_ReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateVariantProduct(stockQuantity: 0);
        var sku = CreateSku(product.Id, stockQuantity: 1);
        var command = CreateCommand(user.Id, product.Id, quantity: 2, productVariantSkuId: sku.Id);

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _productVariantSkuRepository.Setup(x => x.GetByIdAsync(sku.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sku);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Không đủ hàng trong kho cho SKU: {sku.Sku}");

        _productVariantSkuRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductWithVariantsValidSku_UsesSkuStockAndPrice()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateVariantProduct(stockQuantity: 0);
        var sku = CreateSku(product.Id, stockQuantity: 5, price: 1200m, salePrice: 1000m);
        var command = CreateCommand(user.Id, product.Id, quantity: 2, productVariantSkuId: sku.Id);
        Order? capturedOrder = null;

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _productVariantSkuRepository.Setup(x => x.GetByIdAsync(sku.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sku);
        _orderRepository
            .Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .Callback<Order, CancellationToken>((order, _) => capturedOrder = order)
            .ReturnsAsync((Order order, CancellationToken _) => order);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedOrder.Should().NotBeNull();
        capturedOrder!.TotalAmount.Should().Be(2000m);
        capturedOrder.OrderItems.Should().ContainSingle(item =>
            item.ProductId == product.Id &&
            item.ProductVariantSkuId == sku.Id &&
            item.SkuCode == sku.Sku &&
            item.UnitPrice == 1000m &&
            item.Quantity == 2);

        _productVariantSkuRepository.Verify(x => x.TryDecrementStockAsync(sku.Id, product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);
        _productRepository.Verify(x => x.TryDecrementStockAsync(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ProductWithVariantsAtomicSkuUpdateFails_ReturnsBadRequestAndClearsTracking()
    {
        // Arrange
        var user = CreateUser();
        var product = CreateVariantProduct(stockQuantity: 0);
        var sku = CreateSku(product.Id, stockQuantity: 5);
        var command = CreateCommand(user.Id, product.Id, quantity: 2, productVariantSkuId: sku.Id);

        _userRepository.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _productVariantSkuRepository.Setup(x => x.GetByIdAsync(sku.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(sku);
        _productVariantSkuRepository
            .Setup(x => x.TryDecrementStockAsync(sku.Id, product.Id, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be($"Không đủ hàng trong kho cho SKU: {sku.Sku}");

        _unitOfWork.Verify(x => x.ClearTracking(), Times.Once);
        _orderRepository.Verify(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    private static CreateOrderCommand CreateCommand(Guid userId, Guid productId, int quantity, Guid? productVariantSkuId = null)
    {
        return new CreateOrderCommand
        {
            ApplicationUserId = userId,
            Email = "customer@example.com",
            Phone = "0909000000",
            ShippingAddress = "123 Test Street",
            DeliveryInstructions = "Call before delivery",
            OrderItems =
            [
                new CreateOrderItemDto
                {
                    ProductId = productId,
                    ProductVariantSkuId = productVariantSkuId,
                    Quantity = quantity,
                    Color = "Black",
                    Size = "256GB"
                }
            ]
        };
    }

    private static ApplicationUser CreateUser()
    {
        return new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FirstName = "Test",
            LastName = "User",
            Email = "customer@example.com"
        };
    }

    private static Product CreateProduct(int stockQuantity, decimal price = 1000m, decimal? salePrice = null)
    {
        var product = Product.Create(
            "P001",
            "Phone",
            "phone",
            "PHONE-001",
            price,
            salePrice,
            "products/phone.png",
            "Description",
            stockQuantity,
            Guid.NewGuid(),
            Guid.NewGuid());
        product.Id = Guid.NewGuid();
        return product;
    }

    private static Product CreateVariantProduct(int stockQuantity, decimal price = 1000m, decimal? salePrice = null)
    {
        var product = CreateProduct(stockQuantity, price, salePrice);
        product.EnableVariants();
        return product;
    }

    private static ProductVariantSku CreateSku(Guid productId, int stockQuantity, decimal price = 1000m, decimal? salePrice = null)
    {
        var sku = ProductVariantSku.Create(productId, $"SKU-{Guid.NewGuid():N}", price, salePrice, stockQuantity);
        sku.Id = Guid.NewGuid();
        return sku;
    }

    private static PromoCode CreatePromoCode(
        string code,
        PromoCodeType type,
        decimal discountPercentage = 0,
        decimal discountAmount = 0,
        int usageLimit = 0,
        int timesUsed = 0)
    {
        return new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = code,
            Description = $"{code} promo",
            Type = type,
            DiscountPercentage = discountPercentage,
            DiscountAmount = discountAmount,
            FreeShipping = false,
            ValidFrom = DateTime.UtcNow.AddDays(-1),
            ValidTo = DateTime.UtcNow.AddDays(1),
            UsageLimit = usageLimit,
            TimesUsed = timesUsed,
            IsActive = true
        };
    }
}
