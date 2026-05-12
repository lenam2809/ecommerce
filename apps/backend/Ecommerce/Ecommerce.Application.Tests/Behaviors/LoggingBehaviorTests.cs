using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Behaviors;

public class LoggingBehaviorTests
{
    [Fact]
    public async Task Handle_NextSucceeds_LogsStartAndSuccess()
    {
        // Arrange
        var logger = new Mock<IEnhancedLogger>();
        var currentUserService = new Mock<ICurrentUserService>();
        var userId = Guid.NewGuid();
        currentUserService.SetupGet(x => x.UserId).Returns(userId);

        var behavior = new LoggingBehavior<TestRequest, Result<string>>(logger.Object, currentUserService.Object);

        // Act
        var result = await behavior.Handle(new TestRequest(), () => Task.FromResult(Result<string>.Success("ok")), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            "Handling {RequestType}",
            nameof(TestRequest),
            ELogType.Default,
            It.Is<Dictionary<string, object?>?>(properties =>
                properties != null &&
                Equals(properties["RequestType"], nameof(TestRequest)) &&
                Equals(properties["UserId"], userId.ToString()))), Times.Once);
        logger.Verify(x => x.LogAsync(
            ELogLevel.Information,
            "Handled {RequestType} in {ExecutionTimeMs}ms with outcome {Outcome}",
            nameof(TestRequest),
            ELogType.Default,
            It.Is<Dictionary<string, object?>?>(properties =>
                properties != null &&
                Equals(properties["Outcome"], "Success") &&
                Equals(properties["RequestType"], nameof(TestRequest)))), Times.Once);
    }

    [Fact]
    public async Task Handle_NextThrows_LogsExceptionAndRethrows()
    {
        // Arrange
        var logger = new Mock<IEnhancedLogger>();
        var currentUserService = new Mock<ICurrentUserService>();
        currentUserService.SetupGet(x => x.UserId).Returns((Guid?)null);
        var exception = new InvalidOperationException("Handler failed");
        var behavior = new LoggingBehavior<TestRequest, Result<string>>(logger.Object, currentUserService.Object);

        // Act
        var act = () => behavior.Handle(new TestRequest(), () => throw exception, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Handler failed");
        logger.Verify(x => x.LogExceptionAsync(
            exception,
            nameof(TestRequest),
            It.Is<Dictionary<string, object?>?>(properties =>
                properties != null &&
                Equals(properties["Outcome"], "Failed") &&
                Equals(properties["UserId"], "Anonymous")),
            It.IsAny<ELogLevel>()), Times.Once);
    }

    public sealed class TestRequest : IRequest<Result<string>>
    {
    }
}
