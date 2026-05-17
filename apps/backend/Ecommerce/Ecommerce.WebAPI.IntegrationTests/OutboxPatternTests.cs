using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Outbox;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Ecommerce.WebAPI.IntegrationTests;

public sealed class OutboxPatternTests : IDisposable
{
    private readonly CustomWebApplicationFactory _factory = new();

    [Fact]
    public async Task SaveChanges_WhenOrderCreated_CommitsOutboxMessage()
    {
        using var scope = _factory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await db.Users.FirstAsync();
        var product = await db.Products.FirstAsync();

        var order = CreateOrder(user.Id, product);
        await db.Orders.AddAsync(order);
        await db.SaveChangesAsync();

        var outboxMessage = await db.OutboxMessages.SingleAsync(message => message.Status == OutboxMessageStatus.Pending);
        Assert.Equal(typeof(Ecommerce.Domain.Events.OrderCreatedEvent).FullName, outboxMessage.Type);
        Assert.Contains(order.Id.ToString(), outboxMessage.Payload);
        Assert.Null(outboxMessage.ProcessedAtUtc);
    }

    [Fact]
    public async Task SaveChanges_WhenTransactionRollsBack_DoesNotCommitOutboxMessage()
    {
        Guid orderId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await db.Users.FirstAsync();
            var product = await db.Products.FirstAsync();
            using var transaction = await db.Database.BeginTransactionAsync();

            var order = CreateOrder(user.Id, product);
            orderId = order.Id;
            await db.Orders.AddAsync(order);
            await db.SaveChangesAsync();
            await transaction.RollbackAsync();
        }

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            Assert.False(await db.Orders.AnyAsync(order => order.Id == orderId));
            Assert.False(await db.OutboxMessages.AnyAsync(message => message.Payload.Contains(orderId.ToString())));
        }
    }

    [Fact]
    public async Task OutboxProcessor_ProcessesPendingMessage_AndDoesNotReprocessProcessedMessage()
    {
        Guid outboxMessageId;

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var user = await db.Users.FirstAsync();
            var product = await db.Products.FirstAsync();

            var order = CreateOrder(user.Id, product);
            await db.Orders.AddAsync(order);
            await db.SaveChangesAsync();

            outboxMessageId = await db.OutboxMessages
                .Where(message => message.Status == OutboxMessageStatus.Pending)
                .Select(message => message.Id)
                .SingleAsync();
        }

        using (var scope = _factory.CreateScope())
        {
            var processor = scope.ServiceProvider.GetRequiredService<OutboxMessageProcessor>();
            var processedCount = await processor.ProcessPendingAsync();
            Assert.Equal(1, processedCount);
        }

        int notificationCountAfterFirstProcess;
        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var outboxMessage = await db.OutboxMessages.SingleAsync(message => message.Id == outboxMessageId);

            Assert.Equal(OutboxMessageStatus.Processed, outboxMessage.Status);
            Assert.NotNull(outboxMessage.ProcessedAtUtc);
            notificationCountAfterFirstProcess = await db.Notifications.CountAsync();
            Assert.True(notificationCountAfterFirstProcess > 0);
        }

        using (var scope = _factory.CreateScope())
        {
            var processor = scope.ServiceProvider.GetRequiredService<OutboxMessageProcessor>();
            var processedCount = await processor.ProcessPendingAsync();
            Assert.Equal(0, processedCount);
        }

        using (var scope = _factory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Assert.Equal(notificationCountAfterFirstProcess, await db.Notifications.CountAsync());
        }
    }

    public void Dispose()
    {
        _factory.Dispose();
    }

    private static Order CreateOrder(Guid userId, Product product)
    {
        var order = Order.Create(
            userId,
            "Outbox Test User",
            "outbox.customer@example.com",
            "0909000000",
            "123 Outbox Street",
            null,
            null,
            null);

        order.AddOrderItem(product.Id, product.Name, product.Image, 100000m, 1, null, null);
        order.FinalizeCreation("Outbox Test User");
        return order;
    }
}
