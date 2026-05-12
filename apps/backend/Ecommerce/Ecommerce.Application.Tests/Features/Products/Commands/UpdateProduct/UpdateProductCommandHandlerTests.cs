using System.Linq.Expressions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Commands.UpdateProduct;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IFileStorageService> _fileStorageService = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly Mock<ICacheInvalidationService> _cacheInvalidationService = new();
    private readonly Mock<IMediator> _mediator = new();
    private readonly UpdateProductCommandHandler _handler;

    public UpdateProductCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Products).Returns(_productRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _fileStorageService
            .Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync((IFormFile _, string folder) => $"{folder}/uploaded.png");

        _handler = new UpdateProductCommandHandler(
            _unitOfWork.Object,
            _fileStorageService.Object,
            _logger.Object,
            Mock.Of<AutoMapper.IMapper>(),
            _cacheInvalidationService.Object,
            _mediator.Object);
    }

    [Fact]
    public async Task Handle_ExistingProductWithValidCommand_ReturnsSuccessAndUpdatesProduct()
    {
        // Arrange
        var product = CreateExistingProduct();
        var command = CreateValidCommand(product.Id);

        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                command.Id,
                true,
                It.IsAny<Expression<Func<Product, object>>[]>()))
            .ReturnsAsync(product);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(Unit.Value);

        product.Name.Should().Be(command.Name);
        product.Price.Should().Be(command.Price);
        product.SalePrice.Should().Be(command.SalePrice);
        product.StockQuantity.Should().Be(command.StockQuantity);
        product.Image.Should().Be("products/uploaded.png");
        product.Images.Should().HaveCount(2);
        product.Specifications.Should().Contain(s => s.Name == "Display" && s.Value == "OLED");
        product.Variants.Colors.Should().ContainSingle(c => c.Color == "Blue");
        product.Variants.Sizes.Should().ContainSingle(s => s.Size == "512GB");

        _productRepository.Verify(x => x.Update(product), Times.Once);
        _productRepository.Verify(x => x.ClearColorAsync(product.Id, It.IsAny<CancellationToken>()), Times.Once);
        _productRepository.Verify(x => x.ClearSizeAsync(product.Id, It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(product.Id), Times.Once);
        _mediator.Verify(x => x.Publish(
            It.Is<ProductUpdatedEvent>(e => e.ProductId == product.Id),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFoundAndDoesNotPersist()
    {
        // Arrange
        var command = CreateValidCommand(Guid.NewGuid());
#pragma warning disable CS8620 // Repository overload is annotated non-nullable, but handler explicitly handles null.
        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                command.Id,
                true,
                It.IsAny<Expression<Func<Product, object>>[]>()))
            .ReturnsAsync((Product?)null);
#pragma warning restore CS8620

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.NotFound);
        result.Error.Should().Contain(command.Id.ToString());

        _productRepository.Verify(x => x.Update(It.IsAny<Product>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SalePriceGreaterThanPrice_ReturnsBadRequestAndDoesNotPersist()
    {
        // Arrange
        var product = CreateExistingProduct();
        var command = CreateValidCommand(product.Id);
        command.Price = 100m;
        command.SalePrice = 150m;

        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                command.Id,
                true,
                It.IsAny<Expression<Func<Product, object>>[]>()))
            .ReturnsAsync(product);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Sale price must be less than regular price.");

        _productRepository.Verify(x => x.Update(It.IsAny<Product>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(It.IsAny<Guid>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CompleteFails_ReturnsBadRequestAndLogsException()
    {
        // Arrange
        var product = CreateExistingProduct();
        var command = CreateValidCommand(product.Id);

        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                command.Id,
                true,
                It.IsAny<Expression<Func<Product, object>>[]>()))
            .ReturnsAsync(product);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database unavailable"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Contain("Database unavailable");

        _logger.Verify(x => x.LogExceptionAsync(
            It.Is<InvalidOperationException>(ex => ex.Message == "Database unavailable"),
            "Đã xảy ra lỗi khi cập nhật sản phẩm",
            It.IsAny<Dictionary<string, object?>?>(),
            It.IsAny<ELogLevel>()), Times.Once);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(It.IsAny<Guid>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void Handler_AuthorizeAttribute_RequiresEditProductPolicy()
    {
        // Act
        var attribute = typeof(UpdateProductCommandHandler)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: false)
            .Cast<AuthorizeAttribute>()
            .Single();

        // Assert
        attribute.Policy.Should().Be("Staff:EditProduct");
    }

    private static Product CreateExistingProduct()
    {
        var product = Product.Create(
            "P001",
            "Old Phone",
            "old-phone",
            "OLD-PHONE",
            1000m,
            900m,
            "products/old.png",
            "Old description",
            5,
            Guid.NewGuid(),
            Guid.NewGuid());

        product.Id = Guid.NewGuid();
        product.AddImage("products/gallery/old.png");
        product.AddSpecification("CPU", "A17");
        product.SetVariants(["Black"], ["256GB"]);
        return product;
    }

    private static UpdateProductCommand CreateValidCommand(Guid productId)
    {
        return new UpdateProductCommand
        {
            Id = productId,
            Code = "P002",
            Name = "Updated Phone",
            Sku = "UPDATED-PHONE",
            Price = 1200m,
            SalePrice = 1000m,
            Description = "Updated description",
            StockQuantity = 8,
            CategoryId = Guid.NewGuid(),
            BrandId = Guid.NewGuid(),
            IsActive = true,
            MainImage = CreateFormFile(),
            AdditionalImages = [CreateFormFile()],
            AdditionalImageUrls = ["https://cdn.example.com/kept.png"],
            Specifications =
            [
                new ProductSpecificationDto
                {
                    Name = "Display",
                    Value = "OLED"
                }
            ],
            Colors = ["Blue"],
            Sizes = ["512GB"]
        };
    }

    private static IFormFile CreateFormFile()
    {
        var file = new Mock<IFormFile>();
        file.Setup(x => x.Length).Returns(1024);
        file.Setup(x => x.FileName).Returns("product.png");
        return file.Object;
    }
}
