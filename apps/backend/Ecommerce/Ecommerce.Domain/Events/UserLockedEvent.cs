using MediatR;

namespace Ecommerce.Domain.Events
{
    public class UserLockedEvent : INotification
    {
        public Guid UserId { get; }
        public string UserEmail { get; }
        public string Reason { get; }
        public DateTime? ExpiresAt { get; }

        public UserLockedEvent(Guid userId, string userEmail, string reason, DateTime? expiresAt)
        {
            UserId = userId;
            UserEmail = userEmail;
            Reason = reason;
            ExpiresAt = expiresAt;
        }
    }
}

