using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Events;
using FluentAssertions;

namespace Ecommerce.Domain.Tests.Entities;

public class DomainEventsTests
{
    [Fact]
    public void BaseEntity_AddDomainEvent_AddsEvent()
    {
        // Arrange
        var product = ProductTests.CreateProduct();
        var domainEvent = new ProductCreatedEvent(product.Id);

        // Act
        product.AddDomainEvent(domainEvent);

        // Assert
        product.DomainEvents.Should().ContainSingle()
            .Which.Should().Be(domainEvent);
    }

    [Fact]
    public void BaseEntity_RemoveDomainEvent_RemovesEvent()
    {
        // Arrange
        var product = ProductTests.CreateProduct();
        var domainEvent = new ProductCreatedEvent(product.Id);
        product.AddDomainEvent(domainEvent);

        // Act
        product.RemoveDomainEvent(domainEvent);

        // Assert
        product.DomainEvents.Should().BeEmpty();
    }

    [Fact]
    public void ApplicationUser_ClearDomainEvents_RemovesAllEvents()
    {
        // Arrange
        var user = new ApplicationUser { FirstName = "Test", LastName = "User" };
        user.AddDomainEvent(new UserRegisteredEvent(user.Id, "test@example.com", "Test", "User", "Customer"));

        // Act
        user.ClearDomainEvents();

        // Assert
        user.DomainEvents.Should().BeEmpty();
    }
}
