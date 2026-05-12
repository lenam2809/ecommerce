using System.Linq.Expressions;
using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Queries.GetProductById;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Products.Queries.GetProductById;

public class GetProductByIdQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly Mock<IFileStorageService> _fileStorageService = new();
    private readonly Mock<IUserActivityService> _userActivityService = new();
    private readonly GetProductByIdQueryHandler _handler;

    public GetProductByIdQueryHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Products).Returns(_productRepository.Object);
        _fileStorageService
            .Setup(x => x.GetFileUrlAsync(It.IsAny<string>()))
            .ReturnsAsync((string path) => $"https://cdn.example.com/{path}");

        _handler = new GetProductByIdQueryHandler(
            _unitOfWork.Object,
            _mapper.Object,
            _fileStorageService.Object,
            _userActivityService.Object);
    }

    [Fact]
    public async Task Handle_ExistingProduct_ReturnsSuccessWithResolvedImageUrls()
    {
        // Arrange
        var product = CreateProduct();
        var query = new GetProductByIdQuery { Id = product.Id };
        var dto = CreateProductDto(product.Id);

        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                query.Id,
                It.IsAny<Expression<Func<IQueryable<Product>, IQueryable<Product>>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _mapper.Setup(x => x.Map<ProductDto>(product)).Returns(dto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Id.Should().Be(product.Id);
        result.Value.MainImage.Should().Be("https://cdn.example.com/products/main.png");
        result.Value.AdditionalImages.Should().Equal(
            "https://cdn.example.com/products/gallery/1.png",
            "https://cdn.example.com/products/gallery/2.png");

        _fileStorageService.Verify(x => x.GetFileUrlAsync("products/main.png"), Times.Once);
        _fileStorageService.Verify(x => x.GetFileUrlAsync("products/gallery/1.png"), Times.Once);
        _fileStorageService.Verify(x => x.GetFileUrlAsync("products/gallery/2.png"), Times.Once);
        _userActivityService.Verify(x => x.LogActivityAsync(
            "ViewProductBySlug",
            It.Is<string>(value => value.Contains(dto.Name) && value.Contains(dto.Slug)),
            It.IsAny<object>(),
            It.IsAny<Guid?>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFound()
    {
        // Arrange
        var query = new GetProductByIdQuery { Id = Guid.NewGuid() };
        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                query.Id,
                It.IsAny<Expression<Func<IQueryable<Product>, IQueryable<Product>>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.NotFound);
        result.Error.Should().Be("Không tìm thấy sản phẩm.");

        _mapper.Verify(x => x.Map<ProductDto>(It.IsAny<Product>()), Times.Never);
        _fileStorageService.Verify(x => x.GetFileUrlAsync(It.IsAny<string>()), Times.Never);
        _userActivityService.Verify(x => x.LogActivityAsync(
            It.IsAny<string>(),
            It.IsAny<string?>(),
            It.IsAny<object?>(),
            It.IsAny<Guid?>()), Times.Never);
    }

    [Fact]
    public async Task Handle_FileUrlResolutionFails_ReturnsBadRequest()
    {
        // Arrange
        var product = CreateProduct();
        var query = new GetProductByIdQuery { Id = product.Id };
        _productRepository
            .Setup(x => x.GetByIdWithIncludeAsync(
                query.Id,
                It.IsAny<Expression<Func<IQueryable<Product>, IQueryable<Product>>>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _mapper.Setup(x => x.Map<ProductDto>(product)).Returns(CreateProductDto(product.Id));
        _fileStorageService
            .Setup(x => x.GetFileUrlAsync("products/main.png"))
            .ThrowsAsync(new InvalidOperationException("Storage unavailable"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Storage unavailable");

        _userActivityService.Verify(x => x.LogActivityAsync(
            It.IsAny<string>(),
            It.IsAny<string?>(),
            It.IsAny<object?>(),
            It.IsAny<Guid?>()), Times.Never);
    }

    [Fact]
    public void Handler_AuthorizeAttribute_RequiresViewProductsPolicy()
    {
        // Act
        var attribute = typeof(GetProductByIdQueryHandler)
            .GetCustomAttributes(typeof(AuthorizeAttribute), inherit: false)
            .Cast<AuthorizeAttribute>()
            .Single();

        // Assert
        attribute.Policy.Should().Be("ViewProducts");
    }

    private static Product CreateProduct()
    {
        var product = Product.Create(
            "P001",
            "Phone",
            "phone",
            "PHONE-001",
            1000m,
            900m,
            "products/main.png",
            "Description",
            5,
            Guid.NewGuid(),
            Guid.NewGuid());
        product.Id = Guid.NewGuid();
        return product;
    }

    private static ProductDto CreateProductDto(Guid productId)
    {
        return new ProductDto
        {
            Id = productId,
            Code = "P001",
            Sku = "PHONE-001",
            Name = "Phone",
            CategoryName = "Phones",
            CategorySlug = "phones",
            BrandName = "Apple",
            BrandSlug = "apple",
            MainImage = "products/main.png",
            AdditionalImages = ["products/gallery/1.png", "products/gallery/2.png"],
            Slug = "phone",
            Price = 1000m,
            SalePrice = 900m,
            StockQuantity = 5,
            IsActive = true
        };
    }
}
