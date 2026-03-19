using MediatR;

namespace Ecommerce.Domain.Events
{
    /// <summary>
    /// Event triggered when a new user is registered
    /// </summary>
    public class UserRegisteredEvent : INotification
    {
        public Guid UserId { get; }
        public string Email { get; }
        public string FirstName { get; }
        public string LastName { get; }
        public string Role { get; }

        public UserRegisteredEvent(Guid userId, string email, string firstName, string lastName, string role)
        {
            UserId = userId;
            Email = email;
            FirstName = firstName;
            LastName = lastName;
            Role = role;
        }
    }
}

