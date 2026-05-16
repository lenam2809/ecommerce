using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Behaviors;

public class TransactionBehaviorTests
{
    [Fact]
    public async Task Handle_RequestIsQuery_SkipsTransactionAndCallsNext()
    {
        // Arrange
        var unitOfWork = new Mock<IUnitOfWork>();
        var behavior = new TransactionBehavior<TestQuery, Result<string>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());
        var nextCalls = 0;

        // Act
        var result = await behavior.Handle(new TestQuery(), () =>
        {
            nextCalls++;
            return Task.FromResult(Result<string>.Success("query-result"));
        }, CancellationToken.None);

        // Assert
        result.Value.Should().Be("query-result");
        nextCalls.Should().Be(1);
        unitOfWork.Verify(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
        unitOfWork.Verify(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<string>>>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CommandSucceeds_BeginsAndCommitsTransaction()
    {
        // Arrange
        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.Setup(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<string>>>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<Task<Result<string>>> operation, CancellationToken _) => operation());
        var behavior = new TransactionBehavior<TestCommand, Result<string>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());

        // Act
        var result = await behavior.Handle(new TestCommand(), () => Task.FromResult(Result<string>.Success("command-result")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("command-result");
        unitOfWork.Verify(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(x => x.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(x => x.RollbackTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CommandThrows_RollsBackAndRethrows()
    {
        // Arrange
        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.Setup(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<string>>>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<Task<Result<string>>> operation, CancellationToken _) => operation());
        var behavior = new TransactionBehavior<TestCommand, Result<string>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());

        // Act
        var act = () => behavior.Handle(new TestCommand(), () => throw new InvalidOperationException("Handler failed"), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Handler failed");
        unitOfWork.Verify(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(x => x.RollbackTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(x => x.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ActiveTransaction_CallsNextWithoutStartingNewTransaction()
    {
        // Arrange
        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.SetupGet(x => x.HasActiveTransaction).Returns(true);
        var behavior = new TransactionBehavior<TestCommand, Result<string>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());

        // Act
        var result = await behavior.Handle(new TestCommand(), () => Task.FromResult(Result<string>.Success("existing")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("existing");
        unitOfWork.Verify(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Never);
        unitOfWork.Verify(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<string>>>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UnmarkedRequest_BeginsTransactionForBackwardCompatibility()
    {
        // Arrange
        var unitOfWork = new Mock<IUnitOfWork>();
        unitOfWork.Setup(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<string>>>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<Task<Result<string>>> operation, CancellationToken _) => operation());
        var behavior = new TransactionBehavior<UnmarkedRequest, Result<string>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());

        // Act
        var result = await behavior.Handle(new UnmarkedRequest(), () => Task.FromResult(Result<string>.Success("fallback")), CancellationToken.None);

        // Assert
        result.Value.Should().Be("fallback");
        unitOfWork.Verify(x => x.BeginTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
        unitOfWork.Verify(x => x.CommitTransactionAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    public sealed class TestQuery : IQuery<Result<string>>
    {
    }

    public sealed class TestCommand : ICommand<Result<string>>
    {
    }

    public sealed class UnmarkedRequest : IRequest<Result<string>>
    {
    }
}
