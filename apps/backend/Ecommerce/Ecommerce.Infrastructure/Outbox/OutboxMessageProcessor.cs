using Ecommerce.Domain.Events;
using Ecommerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace Ecommerce.Infrastructure.Outbox;

public sealed class OutboxMessageProcessor
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ApplicationDbContext _dbContext;
    private readonly IPublisher _publisher;
    private readonly ILogger<OutboxMessageProcessor> _logger;
    private readonly OutboxOptions _options;

    public OutboxMessageProcessor(
        ApplicationDbContext dbContext,
        IPublisher publisher,
        ILogger<OutboxMessageProcessor> logger,
        IOptions<OutboxOptions> options)
    {
        _dbContext = dbContext;
        _publisher = publisher;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<int> ProcessPendingAsync(CancellationToken cancellationToken = default)
    {
        var messages = await _dbContext.OutboxMessages
            .Where(message =>
                (message.Status == OutboxMessageStatus.Pending || message.Status == OutboxMessageStatus.Failed)
                && message.RetryCount < _options.MaxRetryCount)
            .OrderBy(message => message.OccurredAtUtc)
            .Take(_options.BatchSize)
            .ToListAsync(cancellationToken);

        var processedCount = 0;

        foreach (var message in messages)
        {
            if (await ProcessMessageAsync(message, cancellationToken))
            {
                processedCount++;
            }
        }

        return processedCount;
    }

    private async Task<bool> ProcessMessageAsync(OutboxMessage message, CancellationToken cancellationToken)
    {
        try
        {
            message.Status = OutboxMessageStatus.Processing;
            await _dbContext.SaveChangesAsync(cancellationToken);

            var notification = Deserialize(message);
            await _publisher.Publish(notification, cancellationToken);

            message.Status = OutboxMessageStatus.Processed;
            message.ProcessedAtUtc = DateTime.UtcNow;
            message.Error = null;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return true;
        }
        catch (Exception ex)
        {
            message.Status = OutboxMessageStatus.Failed;
            message.RetryCount++;
            message.Error = Truncate(ex.ToString(), 4000);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogError(
                ex,
                "Failed to process outbox message {OutboxMessageId} of type {OutboxMessageType}",
                message.Id,
                message.Type);

            return false;
        }
    }

    private static INotification Deserialize(OutboxMessage message)
    {
        if (message.Type == typeof(OrderCreatedEvent).FullName)
        {
            return JsonSerializer.Deserialize<OrderCreatedEvent>(message.Payload, JsonOptions)
                ?? throw new InvalidOperationException($"Cannot deserialize outbox message {message.Id}.");
        }

        throw new NotSupportedException($"Outbox message type '{message.Type}' is not supported.");
    }

    private static string Truncate(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
