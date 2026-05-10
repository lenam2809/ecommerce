using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Orders.EventHandlers;
using Ecommerce.Application.Features.Reviews.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Xunit;

namespace Ecommerce.Application.Tests.Orders
{
    public class OrderCreatedEventHandlerTests
    {
        [Fact]
        public async Task Handle_QueuesOrderConfirmationEmail()
        {
            var queue = new CapturingEmailQueue();
            var handler = new OrderCreatedEventHandler(
                new NoopNotificationService(),
                queue,
                new StaticTemplateRenderer());

            await handler.Handle(new OrderCreatedEvent(
                Guid.NewGuid(),
                "ORD-1",
                Guid.NewGuid(),
                "customer@example.com",
                "Customer Name",
                550000,
                2,
                DateTime.UtcNow), CancellationToken.None);

            Assert.Single(queue.Messages);
            Assert.Equal("customer@example.com", queue.Messages[0].To);
            Assert.Contains("ORD-1", queue.Messages[0].Subject);
            Assert.Contains("ORD-1", queue.Messages[0].Body);
        }

        private sealed class CapturingEmailQueue : IEmailQueue
        {
            public List<EmailMessage> Messages { get; } = [];

            public ValueTask QueueEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
            {
                Messages.Add(message);
                return ValueTask.CompletedTask;
            }

            public ValueTask<EmailMessage> DequeueAsync(CancellationToken cancellationToken)
            {
                return ValueTask.FromResult(Messages[0]);
            }
        }

        private sealed class StaticTemplateRenderer : IEmailTemplateRenderer
        {
            public Task<string> RenderAsync(string templateName, IReadOnlyDictionary<string, string> values, CancellationToken cancellationToken = default)
            {
                return Task.FromResult($"template={templateName}; order={values["OrderCode"]}");
            }
        }

        private sealed class NoopNotificationService : INotificationService
        {
            public Task SendOrderStatusNotificationAsync(Guid? userId, Guid orderId, EOrderStatus oldStatus, EOrderStatus newStatus) => Task.CompletedTask;
            public Task SendOrderConfirmationEmailAsync(Guid orderId) => Task.CompletedTask;
            public Task SendAdminNotificationAsync(Guid orderId, string notificationType) => Task.CompletedTask;
            public Task SendNewOrderNotificationAsync(Guid orderId, string orderCode, string customerName, decimal totalAmount, int itemCount) => Task.CompletedTask;
            public Task SendPromotionNotificationAsync(Guid userId, Guid promotionId) => Task.CompletedTask;
            public Task SendCustomerLevelUpgradeNotificationAsync(Guid userId, ECustomerLevel oldLevel, ECustomerLevel newLevel) => Task.CompletedTask;
            public Task SendNotificationToAllAsync(string notificationType, object payload, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendNotificationToUserAsync(string userId, string notificationType, object payload, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendNotificationToGroupAsync(string groupName, string notificationType, object payload, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendReviewNotificationAsync(Guid productId, object payload, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendRatingNotificationAsync(Guid productId, double newRating, int reviewCount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendReviewLikeUpdateNotificationAsync(Guid productId, Guid reviewId, int likeCount, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendReviewReplyNotificationAsync(Guid reviewId, ReviewReplyDto replyDto, CancellationToken cancellationToken = default) => Task.CompletedTask;
            public Task SendPromotionAnnouncementAsync(string title, string message, DateTime? expiresAt = null, Guid? targetUserId = null, string? targetGroup = null, string? actionUrl = null, string? imageUrl = null) => Task.CompletedTask;
            public Task SendMaintenanceNotificationAsync(string title, string message, DateTime scheduledTime, int durationMinutes, string? actionUrl = null) => Task.CompletedTask;
        }
    }
}
