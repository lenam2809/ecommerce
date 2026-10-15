using Ecommerce.Application.Common.Behaviors;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Commands.CreateOrder;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace Ecommerce.Application.Tests.Features.Orders.Commands.CreateOrder;

/// <summary>
/// FLOW-01 verification. Asserts the CORRECT behaviour: if anything unexpected fails after the stock was decremented,
/// either the surrounding transaction is rolled back or the stock is restored explicitly.
/// FAILING = finding reproduced. Filter: --filter "Category=AuditRepro".
/// </summary>
public class AuditCreateOrderUnexpectedFailureTests
{
    [Fact]
    public async Task UnexpectedFailureAfterStockDecrement_RollsBackOrRestoresStock()
    {
        var unitOfWork = new Mock<IUnitOfWork>();
        var users = new Mock<IUserRepository>();
        var products = new Mock<IProductRepository>();
        var orders = new Mock<IOrderRepository>();
        var orderCodes = new Mock<IOrderCodeGenerator>();

        var user = new ApplicationUser { Id = Guid.NewGuid(), FirstName = "T", LastName = "U", Email = "customer@example.com" };
        var product = Product.Create("P001", "Phone", "phone", "PHONE-001", 1000m, null, "products/phone.png", "d", 5, Guid.NewGuid(), Guid.NewGuid());
        product.Id = Guid.NewGuid();

        unitOfWork.SetupGet(x => x.Users).Returns(users.Object);
        unitOfWork.SetupGet(x => x.Products).Returns(products.Object);
        unitOfWork.SetupGet(x => x.Orders).Returns(orders.Object);
        users.Setup(x => x.GetByIdAsync(user.Id)).ReturnsAsync(user);
        products.Setup(x => x.GetByIdAsync(product.Id, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        products.Setup(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        orders.Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>())).ReturnsAsync((Order o, CancellationToken _) => o);
        orderCodes.Setup(x => x.Generate()).Returns(() => $"ORD-{Guid.NewGuid():N}");

        // A non-DbUpdateException failure (e.g. NullReference / mapping / interceptor / serialization bug) at save time.
        unitOfWork.Setup(x => x.CompleteAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("unexpected failure while saving order"));

        unitOfWork.Setup(x => x.ExecuteStrategyAsync(It.IsAny<Func<Task<Result<Guid>>>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<Task<Result<Guid>>> op, CancellationToken _) => op());

        var handler = new CreateOrderCommandHandler(
            unitOfWork.Object, Mock.Of<IEnhancedLogger>(), Mock.Of<IPublisher>(), Mock.Of<ICurrentUserService>(), orderCodes.Object);
        var behavior = new TransactionBehavior<CreateOrderCommand, Result<Guid>>(unitOfWork.Object, Mock.Of<IEnhancedLogger>());

        var command = new CreateOrderCommand
        {
            ApplicationUserId = user.Id,
            Email = "customer@example.com",
            Phone = "0909000000",
            ShippingAddress = "123 Test Street",
            OrderItems = [new CreateOrderItemDto { ProductId = product.Id, Quantity = 2, Color = "Black", Size = "256GB" }]
        };

        var result = await behavior.Handle(command, () => handler.Handle(command, CancellationToken.None), CancellationToken.None);

        result.IsSuccess.Should().BeFalse("the order was not saved");
        products.Verify(x => x.TryDecrementStockAsync(product.Id, 2, It.IsAny<CancellationToken>()), Times.Once);

        var restored = products.Invocations.Count(i => i.Method.Name == nameof(IProductRepository.RestoreStockAsync));
        var rolledBack = unitOfWork.Invocations.Count(i => i.Method.Name == nameof(IUnitOfWork.RollbackTransactionAsync));
        var committed = unitOfWork.Invocations.Count(i => i.Method.Name == nameof(IUnitOfWork.CommitTransactionAsync));

        (restored + rolledBack).Should().BeGreaterThan(0,
            $"stock was decremented but order not saved; observed commits={committed}, rollbacks={rolledBack}, explicit restores={restored}");
    }
}
