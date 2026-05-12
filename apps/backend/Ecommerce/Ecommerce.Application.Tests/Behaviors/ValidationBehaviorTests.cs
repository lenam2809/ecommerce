using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Models;
using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Behaviors;

public class ValidationBehaviorTests
{
    [Fact]
    public async Task Handle_ValidatorReturnsFailures_ThrowsValidationExceptionAndDoesNotCallNext()
    {
        // Arrange
        var validator = new Mock<IValidator<TestRequest>>();
        validator
            .Setup(x => x.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult(
            [
                new ValidationFailure(nameof(TestRequest.Name), "Name is required")
            ]));

        var behavior = new ValidationBehavior<TestRequest, Result<string>>([validator.Object]);
        var nextCalls = 0;

        // Act
        var act = () => behavior.Handle(new TestRequest(), () =>
        {
            nextCalls++;
            return Task.FromResult(Result<string>.Success("ok"));
        }, CancellationToken.None);

        // Assert
        var exception = await act.Should().ThrowAsync<ValidationException>();
        exception.Which.Errors.Should().ContainSingle(error =>
            error.PropertyName == nameof(TestRequest.Name) &&
            error.ErrorMessage == "Name is required");
        nextCalls.Should().Be(0);
    }

    [Fact]
    public async Task Handle_RequestIsValid_CallsNextAndReturnsResponse()
    {
        // Arrange
        var validator = new Mock<IValidator<TestRequest>>();
        validator
            .Setup(x => x.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ValidationResult());

        var behavior = new ValidationBehavior<TestRequest, Result<string>>([validator.Object]);
        var expected = Result<string>.Success("ok");
        var nextCalls = 0;

        // Act
        var result = await behavior.Handle(new TestRequest { Name = "Valid" }, () =>
        {
            nextCalls++;
            return Task.FromResult(expected);
        }, CancellationToken.None);

        // Assert
        result.Should().BeSameAs(expected);
        nextCalls.Should().Be(1);
    }

    [Fact]
    public async Task Handle_NoValidators_CallsNext()
    {
        // Arrange
        var behavior = new ValidationBehavior<TestRequest, Result<string>>([]);
        var nextCalls = 0;

        // Act
        var result = await behavior.Handle(new TestRequest(), () =>
        {
            nextCalls++;
            return Task.FromResult(Result<string>.Success("ok"));
        }, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().Be("ok");
        nextCalls.Should().Be(1);
    }

    public sealed class TestRequest : IRequest<Result<string>>
    {
        public string Name { get; set; } = string.Empty;
    }
}
