using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Commands.RegisterUser;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Auth.Commands.RegisterUser;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<ICartRepository> _cartRepository = new();
    private readonly Mock<IWishlistRepository> _wishlistRepository = new();
    private readonly Mock<IPublisher> _publisher = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Users).Returns(_userRepository.Object);
        _unitOfWork.SetupGet(x => x.Carts).Returns(_cartRepository.Object);
        _unitOfWork.SetupGet(x => x.Wishlists).Returns(_wishlistRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _handler = new RegisterCommandHandler(
            _unitOfWork.Object,
            _publisher.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsSuccessAndCreatesUserCartWishlistAndRole()
    {
        // Arrange
        var command = CreateCommand();
        var userId = Guid.NewGuid();
        ApplicationUser? capturedUser = null;

        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync((ApplicationUser?)null);
        _userRepository
            .Setup(x => x.AddAsync(It.IsAny<ApplicationUser>(), command.Password))
            .Callback<ApplicationUser, string>((user, _) =>
            {
                user.Id = userId;
                capturedUser = user;
            })
            .ReturnsAsync((ApplicationUser user, string _) => user);
        _cartRepository
            .Setup(x => x.AddAsync(It.IsAny<Ecommerce.Domain.Entities.Cart>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Ecommerce.Domain.Entities.Cart cart, CancellationToken _) => cart);
        _wishlistRepository
            .Setup(x => x.AddAsync(It.IsAny<Wishlist>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Wishlist wishlist, CancellationToken _) => wishlist);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be(userId);

        capturedUser.Should().NotBeNull();
        capturedUser!.Email.Should().Be(command.Email);
        capturedUser.UserName.Should().Be(command.Email);
        capturedUser.FullName.Should().Be("Test User");
        capturedUser.CustomerLevel.Should().Be(ECustomerLevel.Bronze);

        _cartRepository.Verify(x => x.AddAsync(
            It.Is<Ecommerce.Domain.Entities.Cart>(cart => cart.ApplicationUserId == userId),
            It.IsAny<CancellationToken>()), Times.Once);
        _wishlistRepository.Verify(x => x.AddAsync(
            It.Is<Wishlist>(wishlist => wishlist.ApplicationUserId == userId),
            It.IsAny<CancellationToken>()), Times.Once);
        _userRepository.Verify(x => x.AddToRoleAsync(capturedUser, EUserRoles.Customer), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        _publisher.Verify(x => x.Publish(
            It.Is<UserRegisteredEvent>(e =>
                e.UserId == userId &&
                e.Email == command.Email &&
                e.Role == EUserRoles.Customer),
            It.IsAny<CancellationToken>()), Times.Once);
        _logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            "User registered successfully with role {RoleName}",
            "RegisterSuccess",
            ELogType.Security,
            It.IsAny<Dictionary<string, object?>?>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EmailAlreadyExists_ReturnsBadRequest()
    {
        // Arrange
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync(CreateUser(command.Email));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Email đã được sử dụng.");

        _userRepository.Verify(x => x.AddAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PasswordConfirmationDoesNotMatch_ReturnsBadRequest()
    {
        // Arrange
        var command = CreateCommand();
        command.ConfirmPassword = "DifferentPass1!";
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Mật khẩu và xác nhận mật khẩu không khớp.");

        _userRepository.Verify(x => x.AddAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UserRepositoryReturnsNull_ReturnsBadRequest()
    {
        // Arrange
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync((ApplicationUser?)null);
        _userRepository.Setup(x => x.AddAsync(It.IsAny<ApplicationUser>(), command.Password))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Không thể đăng ký người dùng.");

        _cartRepository.Verify(x => x.AddAsync(It.IsAny<Ecommerce.Domain.Entities.Cart>(), It.IsAny<CancellationToken>()), Times.Never);
        _wishlistRepository.Verify(x => x.AddAsync(It.IsAny<Wishlist>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UserRepositoryThrows_ReturnsBadRequestAndLogsException()
    {
        // Arrange
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync((ApplicationUser?)null);
        _userRepository.Setup(x => x.AddAsync(It.IsAny<ApplicationUser>(), command.Password))
            .ThrowsAsync(new InvalidOperationException("Identity unavailable"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Lỗi khi đăng ký: Identity unavailable");

        _logger.Verify(x => x.LogExceptionAsync(
            It.Is<InvalidOperationException>(ex => ex.Message == "Identity unavailable"),
            "Đã xảy ra lỗi khi đăng ký",
            It.IsAny<Dictionary<string, object?>?>(),
            It.IsAny<ELogLevel>()), Times.Once);
        _logger.Verify(x => x.LogAsync(
            ELogLevel.Warning,
            "User registration failed",
            "RegisterFailed",
            ELogType.Security,
            It.IsAny<Dictionary<string, object?>?>()), Times.Once);
    }

    private static RegisterCommand CreateCommand()
    {
        return new RegisterCommand
        {
            Email = "new.customer@example.com",
            PhoneNumber = "0909000000",
            Password = "StrongPass1!",
            ConfirmPassword = "StrongPass1!",
            FirstName = "Test",
            LastName = "User"
        };
    }

    private static ApplicationUser CreateUser(string email)
    {
        return new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = email,
            FirstName = "Existing",
            LastName = "User"
        };
    }
}
