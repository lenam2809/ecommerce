using System.Linq.Expressions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Cart.Commands.AddToCart;
using Ecommerce.Application.Features.Cart.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Services;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Cart.Commands.AddToCart;

public class AddToCartCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<ICartRepository> _cartRepository = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly Mock<IShippingCalculator> _shippingCalculator = new();
    private readonly Mock<IGuestCartService> _guestCartService = new();
    private readonly AddToCartCommandHandler _handler;

    public AddToCartCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Products).Returns(_productRepository.Object);
        _unitOfWork.SetupGet(x => x.Carts).Returns(_cartRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _shippingCalculator
            .Setup(x => x.CalculateShippingCost(It.IsAny<decimal>(), It.IsAny<string?>()))
            .Returns(30000m);

        _handler = new AddToCartCommandHandler(
            _unitOfWork.Object,
            _currentUserService.Object,
            _shippingCalculator.Object,
            _guestCartService.Object);
    }

    [Fact]
    public async Task Handle_AuthenticatedUserWithValidProduct_ReturnsSuccessAndPersistsCart()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var product = CreateProduct(stockQuantity: 10, price: 100000m, salePrice: 90000m);
        var command = new AddToCartCommand
        {
            ProductId = product.Id,
            Quantity = 2,
            Color = "Black",
            Size = "256GB"
        };

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _currentUserService.SetupGet(x => x.GuestId).Returns((string?)null);
        _productRepository
            .Setup(x => x.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _cartRepository
            .Setup(x => x.GetCartAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Ecommerce.Domain.Entities.Cart)null!);
        _cartRepository
            .Setup(x => x.AddAsync(It.IsAny<Ecommerce.Domain.Entities.Cart>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Ecommerce.Domain.Entities.Cart cart, CancellationToken _) => cart);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Items.Should().ContainSingle(item =>
            item.ProductId == product.Id &&
            item.Quantity == 2 &&
            item.Price == 90000m &&
            item.Color == "Black" &&
            item.Size == "256GB");
        result.Value.Subtotal.Should().Be(180000m);
        result.Value.ShippingCost.Should().Be(30000m);
        result.Value.Total.Should().Be(210000m);

        _cartRepository.Verify(x => x.AddAsync(It.IsAny<Ecommerce.Domain.Entities.Cart>(), It.IsAny<CancellationToken>()), Times.Once);
        _shippingCalculator.Verify(x => x.CalculateShippingCost(180000m, It.IsAny<string?>()), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_GuestUserWithValidProduct_DelegatesToGuestCartService()
    {
        // Arrange
        var product = CreateProduct();
        var command = new AddToCartCommand { ProductId = product.Id, Quantity = 1 };
        var guestCart = new CartDto { Items = [], Subtotal = 100000m, Total = 100000m };

        _currentUserService.SetupGet(x => x.UserId).Returns((Guid?)null);
        _currentUserService.SetupGet(x => x.GuestId).Returns("guest-1");
        _productRepository
            .Setup(x => x.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _guestCartService
            .Setup(x => x.AddItemAsync("guest-1", product, command.Quantity, command.Color, command.Size, It.IsAny<CancellationToken>()))
            .ReturnsAsync(guestCart);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeSameAs(guestCart);
        _guestCartService.Verify(x => x.AddItemAsync("guest-1", product, command.Quantity, command.Color, command.Size, It.IsAny<CancellationToken>()), Times.Once);
        _cartRepository.Verify(x => x.AddAsync(It.IsAny<Ecommerce.Domain.Entities.Cart>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoUserAndNoGuestId_ReturnsUnauthorized()
    {
        // Arrange
        _currentUserService.SetupGet(x => x.UserId).Returns((Guid?)null);
        _currentUserService.SetupGet(x => x.GuestId).Returns((string?)null);

        // Act
        var result = await _handler.Handle(new AddToCartCommand { ProductId = Guid.NewGuid(), Quantity = 1 }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Unauthorized);
        result.Error.Should().Be("Vui lòng đăng nhập hoặc cung cấp Guest ID.");

        _productRepository.Verify(x => x.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ThrowsException()
    {
        // Arrange
        var productId = Guid.NewGuid();
        _currentUserService.SetupGet(x => x.UserId).Returns(Guid.NewGuid());
        _productRepository
            .Setup(x => x.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act
        var act = () => _handler.Handle(new AddToCartCommand { ProductId = productId, Quantity = 1 }, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage($"Không tìm thấy sản phẩm với ID {productId}");

        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_QuantityExceedsStock_ThrowsExceptionAndDoesNotComplete()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var product = CreateProduct(stockQuantity: 1);
        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _productRepository
            .Setup(x => x.FirstOrDefaultAsync(It.IsAny<Expression<Func<Product, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _cartRepository
            .Setup(x => x.GetCartAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Ecommerce.Domain.Entities.Cart(userId));

        // Act
        var act = () => _handler.Handle(new AddToCartCommand { ProductId = product.Id, Quantity = 2 }, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Không đủ hàng trong kho. Kho còn: 1");

        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    private static Product CreateProduct(int stockQuantity = 10, decimal price = 100000m, decimal? salePrice = null)
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
}
