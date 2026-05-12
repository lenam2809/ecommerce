using System.Collections;
using System.Linq.Expressions;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Auth.Commands.LoginUser;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Auth.Commands.LoginUser;

public class LoginUserCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IAccountLockRepository> _accountLockRepository = new();
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IFileStorageService> _fileStorageService = new();
    private readonly Mock<IEnhancedLogger> _logger = new();
    private readonly Mock<IUserActivityService> _userActivityService = new();
    private readonly Mock<IMergeCartService> _mergeCartService = new();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly LoginUserCommandHandler _handler;

    public LoginUserCommandHandlerTests()
    {
        _unitOfWork.SetupGet(x => x.Users).Returns(_userRepository.Object);
        _unitOfWork.SetupGet(x => x.AccountLocks).Returns(_accountLockRepository.Object);
        _unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _accountLockRepository.Setup(x => x.IsUserLockedAsync(It.IsAny<Guid>()))
            .ReturnsAsync(false);
        _tokenService.Setup(x => x.GenerateAccessToken(It.IsAny<ApplicationUser>(), It.IsAny<IEnumerable<string>>(), It.IsAny<IEnumerable<string>>()))
            .Returns("access-token");
        _tokenService.Setup(x => x.GenerateRefreshToken()).Returns("raw-refresh-token");
        _tokenService.Setup(x => x.HashToken("raw-refresh-token")).Returns("hashed-refresh-token");
        _fileStorageService.Setup(x => x.GetFileUrlAsync(It.IsAny<string>()))
            .ReturnsAsync((string path) => $"https://cdn.example.com/{path}");

        _handler = new LoginUserCommandHandler(
            _unitOfWork.Object,
            _tokenService.Object,
            _fileStorageService.Object,
            _logger.Object,
            _userActivityService.Object,
            _mergeCartService.Object,
            _currentUserService.Object);
    }

    [Fact]
    public async Task Handle_ValidCredentials_ReturnsSuccessAndCreatesRefreshToken()
    {
        // Arrange
        var user = CreateUser();
        var command = CreateCommand();
        var permissions = new[]
        {
            new Permission { Name = "Products.View", Description = "View products" }
        };

        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync(user);
        _userRepository.Setup(x => x.CheckPasswordAsync(user, command.Password)).ReturnsAsync(true);
        _userRepository.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(["Customer"]);
        _userRepository.Setup(x => x.GetPermissionsQuery(user)).Returns(permissions.AsAsyncQueryable());
        _currentUserService.SetupGet(x => x.GuestId).Returns("guest-1");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.UserId.Should().Be(user.Id);
        result.Value.Email.Should().Be(user.Email);
        result.Value.AccessToken.Should().Be("access-token");
        result.Value.RefreshToken.Should().Be("raw-refresh-token");
        result.Value.Roles.Should().ContainSingle().Which.Should().Be("Customer");
        result.Value.Permissions.Should().ContainSingle().Which.Should().Be("Products.View");
        result.Value.Avatar.Should().Be("https://cdn.example.com/avatars/user.png");

        user.RefreshTokens.Should().ContainSingle(token =>
            token.Token == "hashed-refresh-token" &&
            token.TokenHash == "hashed-refresh-token" &&
            token.IpSubnet == "192.168.1");
        _userRepository.Verify(x => x.ResetAccessFailedCountAsync(user), Times.Once);
        _userRepository.Verify(x => x.UpdateAsync(user), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mergeCartService.Verify(x => x.MergeGuestCartToUserAsync(user.Id, "guest-1", It.IsAny<CancellationToken>()), Times.Once);
        _userActivityService.Verify(x => x.LogActivityAsync("Login", "Login successful", string.Empty, user.Id), Times.Once);
    }

    [Fact]
    public async Task Handle_UserNotFound_ReturnsBadRequest()
    {
        // Arrange
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Invalid email or password.");

        _userRepository.Verify(x => x.CheckPasswordAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UserIsLocked_ReturnsBadRequestWithLockDetails()
    {
        // Arrange
        var user = CreateUser();
        var lockExpiresAt = DateTime.UtcNow.AddMinutes(30);
        var command = CreateCommand();

        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync(user);
        _accountLockRepository.Setup(x => x.IsUserLockedAsync(user.Id)).ReturnsAsync(true);
        _accountLockRepository.Setup(x => x.GetActiveLockAsync(user.Id))
            .ReturnsAsync(new AccountLock
            {
                UserId = user.Id,
                Reason = "Manual review",
                LockType = ELockType.Temporary,
                ExpiresAt = lockExpiresAt
            });

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Contain("Account is locked. Reason: Manual review.");

        _userRepository.Verify(x => x.CheckPasswordAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_InvalidPasswordBelowLockThreshold_ReturnsRemainingAttempts()
    {
        // Arrange
        var user = CreateUser();
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync(user);
        _userRepository.Setup(x => x.CheckPasswordAsync(user, command.Password)).ReturnsAsync(false);
        _userRepository.Setup(x => x.GetAccessFailedCountAsync(user)).ReturnsAsync(2);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Invalid email or password. Remaining attempts: 3.");

        _userRepository.Verify(x => x.AccessFailedAsync(user), Times.Once);
        _accountLockRepository.Verify(x => x.LockUserAsync(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<ELockType>(),
            It.IsAny<DateTime?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>()), Times.Never);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_InvalidPasswordAtLockThreshold_LocksUserAndReturnsBadRequest()
    {
        // Arrange
        var user = CreateUser();
        var command = CreateCommand();
        _userRepository.Setup(x => x.GetByEmailAsync(command.Email)).ReturnsAsync(user);
        _userRepository.Setup(x => x.CheckPasswordAsync(user, command.Password)).ReturnsAsync(false);
        _userRepository.Setup(x => x.GetAccessFailedCountAsync(user)).ReturnsAsync(5);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.ErrorType.Should().Be(ResultError.BadRequest);
        result.Error.Should().Be("Account locked for 30 minutes due to too many failed attempts.");
        user.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<UserLockedEvent>();

        _accountLockRepository.Verify(x => x.LockUserAsync(
            user.Id,
            "Too many failed login attempts",
            ELockType.Temporary,
            It.IsAny<DateTime?>(),
            It.IsAny<Guid?>(),
            It.IsAny<string?>()), Times.Once);
        _unitOfWork.Verify(x => x.CompleteAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    private static LoginUserCommand CreateCommand()
    {
        return new LoginUserCommand
        {
            Email = "customer@example.com",
            Password = "StrongPass1!",
            UserAgent = "Mozilla/5.0",
            IpAddress = "192.168.1.55"
        };
    }

    private static ApplicationUser CreateUser()
    {
        return new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "customer@example.com",
            FirstName = "Test",
            LastName = "User",
            FullName = "Test User",
            PhoneNumber = "0909000000",
            Avatar = "avatars/user.png"
        };
    }
}

internal static class AsyncQueryableTestExtensions
{
    public static IQueryable<T> AsAsyncQueryable<T>(this IEnumerable<T> source)
    {
        return new TestAsyncEnumerable<T>(source);
    }

    private sealed class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable)
            : base(enumerable)
        {
        }

        public TestAsyncEnumerable(Expression expression)
            : base(expression)
        {
        }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        }

        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    private sealed class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;

        public TestAsyncEnumerator(IEnumerator<T> inner)
        {
            _inner = inner;
        }

        public T Current => _inner.Current;

        public ValueTask DisposeAsync()
        {
            _inner.Dispose();
            return ValueTask.CompletedTask;
        }

        public ValueTask<bool> MoveNextAsync()
        {
            return ValueTask.FromResult(_inner.MoveNext());
        }
    }

    private sealed class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;

        public TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression)
        {
            return new TestAsyncEnumerable<TEntity>(expression);
        }

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        {
            return new TestAsyncEnumerable<TElement>(expression);
        }

        public object? Execute(Expression expression)
        {
            return _inner.Execute(expression);
        }

        public TResult Execute<TResult>(Expression expression)
        {
            return _inner.Execute<TResult>(expression);
        }

        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
        {
            var resultType = typeof(TResult).GetGenericArguments()[0];
            var result = typeof(IQueryProvider)
                .GetMethods()
                .Single(method => method.Name == nameof(IQueryProvider.Execute) && method.IsGenericMethod)
                .MakeGenericMethod(resultType)
                .Invoke(_inner, [expression]);

            return (TResult)typeof(Task)
                .GetMethod(nameof(Task.FromResult))!
                .MakeGenericMethod(resultType)
                .Invoke(null, [result])!;
        }
    }
}
