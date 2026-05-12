using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Commands.CreateProduct;
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

namespace Ecommerce.Application.Tests.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly Mock<ICacheInvalidationService> _cacheInvalidationService = new();
    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IFileStorageService> _fileStorageService = new();
    private readonly CreateProductCommandHandler _handler;

    public CreateProductCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Products).Returns(_productRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _fileStorageService
            .Setup(x => x.SaveFileAsync(It.IsAny<IFormFile>(), It.IsAny<string>()))
            .ReturnsAsync((IFormFile _, string folder) => $"{folder}/uploaded.png");

        _handler = new CreateProductCommandHandler(
            _unitOfWork.Object,
            _logger.Object,
            Mock.Of<AutoMapper.IMapper>(),
            _cacheInvalidationService.Object,
            _mediator.Object,
            _fileStorageService.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessAndPersistsProduct()
    {
        // Arrange
        var command = CreateValidCommand();
        var productId = Guid.NewGuid();
        Product? capturedProduct = null;

        _productRepository
            .Setup(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .Callback<Product, CancellationToken>((product, _) =>
            {
                product.Id = productId;
                capturedProduct = product;
            })
            .ReturnsAsync((Product product, CancellationToken _) => product);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(productId);

        capturedProduct.Should().NotBeNull();
        capturedProduct!.Code.Should().Be(command.Code);
        capturedProduct.Name.Should().Be(command.Name);
        capturedProduct.Sku.Should().Be(command.Sku);
        capturedProduct.Price.Should().Be(command.Price);
        capturedProduct.SalePrice.Should().Be(command.SalePrice);
        capturedProduct.Image.Should().Be("products/uploaded.png");
        capturedProduct.Images.Should().HaveCount(2);
        capturedProduct.Specifications.Should().ContainSingle(s => s.Name == "CPU" && s.Value == "A18");
        capturedProduct.Variants.Colors.Should().ContainSingle(c => c.Color == "Black");
        capturedProduct.Variants.Sizes.Should().ContainSingle(s => s.Size == "256GB");

        _fileStorageService.Verify(x => x.SaveFileAsync(command.MainImage, "products"), Times.Once);
        _fileStorageService.Verify(x => x.SaveFileAsync(command.AdditionalImages[0], "products/gallery"), Times.Once);
        _productRepository.Verify(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(productId), Times.Once);
        _mediator.Verify(x => x.Publish(
            It.Is<ProductCreatedEvent>(e => e.ProductId == productId),
            It.IsAny<CancellationToken>()), Times.Once);
        _logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            "Product created successfully for {ProductId}",
            "CreateProduct",
            It.IsAny<ELogType>(),
            It.Is<Dictionary<string, object?>?>(p => p != null && Equals(p["ProductId"], productId))), Times.Once);
    }

    [Fact]
    public async Task Handle_SalePriceGreaterThanPrice_ThrowsArgumentExceptionAndDoesNotPersist()
    {
        // Arrange
        var command = CreateValidCommand();
        command.Price = 100m;
        command.SalePrice = 150m;

        // Act
        var act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Sale price must be less than regular price.");

        _productRepository.Verify(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(It.IsAny<Guid>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_FileStorageFails_ThrowsAndDoesNotPersist()
    {
        // Arrange
        var command = CreateValidCommand();
        _fileStorageService
            .Setup(x => x.SaveFileAsync(command.MainImage, "products"))
            .ThrowsAsync(new InvalidOperationException("Storage unavailable"));

        // Act
        var act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Storage unavailable");

        _productRepository.Verify(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_RepositoryAddFails_ThrowsAndDoesNotCompleteOrPublishEvent()
    {
        // Arrange
        var command = CreateValidCommand();
        _productRepository
            .Setup(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Database unavailable"));

        // Act
        var act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Database unavailable");

        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
        _logger.Verify(x => x.LogAsync(
            It.IsAny<ELogLevel>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<ELogType>(),
            It.IsAny<Dictionary<string, object?>?>()), Times.Never);
        _cacheInvalidationService.Verify(x => x.InvalidateProductCache(It.IsAny<Guid>()), Times.Never);
        _mediator.Verify(x => x.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public void Handler_AuthorizeAttribute_RequiresCreateProductPolicy()
    {
        // Act
        var attribute = typeof(CreateProductCommandHandler)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: false)
            .Cast<AuthorizeAttribute>()
            .Single();

        // Assert
        attribute.Policy.Should().Be(EPermissions.CreateProduct);
    }

    private static CreateProductCommand CreateValidCommand()
    {
        return new CreateProductCommand
        {
            Code = "P001",
            Name = "iPhone 16 Pro",
            Sku = "IPHONE16-PRO",
            Price = 30000000m,
            SalePrice = 29000000m,
            Description = "Flagship phone",
            StockQuantity = 10,
            CategoryId = Guid.NewGuid(),
            BrandId = Guid.NewGuid(),
            MainImage = CreateFormFile(),
            AdditionalImages = [CreateFormFile()],
            AdditionalImageUrls = ["https://cdn.example.com/existing.png"],
            Specifications =
            [
                new ProductSpecificationDto
                {
                    Name = "CPU",
                    Value = "A18"
                }
            ],
            Colors = ["Black"],
            Sizes = ["256GB"]
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
