using Ecommerce.Domain.Events;
using MediatR;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Outbox;

public static class OutboxMessageFactory
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static bool TryCreate(INotification domainEvent, out OutboxMessage outboxMessage)
    {
        outboxMessage = null!;

        if (domainEvent is not OrderCreatedEvent orderCreatedEvent)
        {
            return false;
        }

        outboxMessage = new OutboxMessage
        {
            Id = Guid.NewGuid(),
            Type = typeof(OrderCreatedEvent).FullName!,
            Payload = JsonSerializer.Serialize(orderCreatedEvent, JsonOptions),
            OccurredAtUtc = DateTime.UtcNow,
            Status = OutboxMessageStatus.Pending
        };

        return true;
    }
}
