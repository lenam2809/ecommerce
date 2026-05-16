using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reviews.Commands.CreateReview;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Reviews.Commands.CreateReview;

public class CreateReviewCommandHandlerTests
{
    private readonly Mock<IReviewRepository> _reviewRepository = new();
    private readonly Mock<IProductRepository> _productRepository = new();
    private readonly Mock<IFileStorageService> _fileStorage = new();
    private readonly Mock<IMapper> _mapper = new();
    private readonly Mock<INotificationService> _notificationService = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly CreateReviewCommandHandler _handler;

    public CreateReviewCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Users).Returns(_userRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _fileStorage.Setup(x => x.GetFileUrlAsync(It.IsAny<string>()))
            .ReturnsAsync((string path) => path);
        _mapper.Setup(x => x.Map<ReviewDto>(It.IsAny<Review>()))
            .Returns((Review review) => new ReviewDto
            {
                Id = review.Id,
                UserName = review.UserName,
                UserAvatar = review.UserAvatar,
                Rating = review.Rating,
                Content = review.Content,
                Date = review.Date,
                IsVerified = review.IsVerified,
                ProductId = review.ProductId,
                ApplicationUserId = review.ApplicationUserId,
                Images = review.Images.Select(image => image.Url).ToList()
            });

        _handler = new CreateReviewCommandHandler(
            _reviewRepository.Object,
            _productRepository.Object,
            _fileStorage.Object,
            _mapper.Object,
            _notificationService.Object,
            _unitOfWork.Object,
            _currentUserService.Object);
    }

    [Fact]
    public async Task Handle_UserNotAuthenticated_ReturnsUnauthorizedWithoutCrashing()
    {
        var result = await _handler.Handle(new CreateReviewCommand
        {
            ProductId = Guid.NewGuid(),
            Rating = 5,
            Content = "Good"
        }, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Unauthorized);
        _productRepository.Verify(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_DuplicateReview_ReturnsConflict()
    {
        var userId = Guid.NewGuid();
        var product = CreateProduct();

        _currentUserService.SetupGet(x => x.UserId).Returns(userId);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        _userRepository.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(CreateUser(userId));
        _reviewRepository
            .Setup(x => x.ExistsForProductByUserAsync(product.Id, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _handler.Handle(new CreateReviewCommand
        {
            ProductId = product.Id,
            UserId = Guid.NewGuid(),
            Rating = 4,
            Content = "Good"
        }, CancellationToken.None);

        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.Conflict);
        _reviewRepository.Verify(x => x.AddAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_OpenReview_UsesCurrentUserAndStoresSanitizedPlainText()
    {
        var currentUserId = Guid.NewGuid();
        var product = CreateProduct();
        Review? savedReview = null;

        _currentUserService.SetupGet(x => x.UserId).Returns(currentUserId);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        _userRepository.Setup(x => x.GetByIdAsync(currentUserId)).ReturnsAsync(CreateUser(currentUserId));
        _reviewRepository
            .Setup(x => x.ExistsForProductByUserAsync(product.Id, currentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _reviewRepository
            .Setup(x => x.HasDeliveredPurchaseAsync(product.Id, currentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _reviewRepository
            .Setup(x => x.AddAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()))
            .Callback<Review, CancellationToken>((review, _) => savedReview = review)
            .ReturnsAsync((Review review, CancellationToken _) => review);
        _reviewRepository
            .Setup(x => x.GetRatingSummaryAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((5.0, 1));

        var result = await _handler.Handle(new CreateReviewCommand
        {
            ProductId = product.Id,
            UserId = Guid.NewGuid(),
            Rating = 5,
            Content = "<script>alert(1)</script> Great"
        }, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        savedReview.Should().NotBeNull();
        savedReview!.ApplicationUserId.Should().Be(currentUserId);
        savedReview.IsVerified.Should().BeFalse();
        savedReview.Content.Should().NotContain("<script>");
        savedReview.Content.Should().Contain("&lt;script&gt;");
        product.Rating.Should().Be(5.0);
        product.ReviewCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_DeliveredBuyerReview_SetsVerifiedPurchaseFlag()
    {
        var currentUserId = Guid.NewGuid();
        var product = CreateProduct();
        Review? savedReview = null;

        _currentUserService.SetupGet(x => x.UserId).Returns(currentUserId);
        _productRepository.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        _userRepository.Setup(x => x.GetByIdAsync(currentUserId)).ReturnsAsync(CreateUser(currentUserId));
        _reviewRepository
            .Setup(x => x.ExistsForProductByUserAsync(product.Id, currentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        _reviewRepository
            .Setup(x => x.HasDeliveredPurchaseAsync(product.Id, currentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _reviewRepository
            .Setup(x => x.AddAsync(It.IsAny<Review>(), It.IsAny<CancellationToken>()))
            .Callback<Review, CancellationToken>((review, _) => savedReview = review)
            .ReturnsAsync((Review review, CancellationToken _) => review);
        _reviewRepository
            .Setup(x => x.GetRatingSummaryAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((4.0, 1));

        var result = await _handler.Handle(new CreateReviewCommand
        {
            ProductId = product.Id,
            Rating = 4,
            Content = "Delivered order review"
        }, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        savedReview.Should().NotBeNull();
        savedReview!.IsVerified.Should().BeTrue();
        result.Value.IsVerified.Should().BeTrue();
    }

    private static Product CreateProduct()
    {
        var product = Product.Create(
            "P001",
            "Test Product",
            "test-product",
            "SKU001",
            100000m,
            null,
            "product.png",
            "Description",
            10,
            Guid.NewGuid(),
            Guid.NewGuid());
        product.Id = Guid.NewGuid();
        return product;
    }

    private static ApplicationUser CreateUser(Guid id)
    {
        return new ApplicationUser
        {
            Id = id,
            FirstName = "Test",
            LastName = "User",
            UserName = "testuser",
            Email = "test@example.com",
            Avatar = "avatar.png"
        };
    }
}
