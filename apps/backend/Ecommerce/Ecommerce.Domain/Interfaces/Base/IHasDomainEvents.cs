using MediatR;

namespace Ecommerce.Domain.Interfaces.Base
{
    public interface IHasDomainEvents
    {
        IReadOnlyCollection<INotification> DomainEvents { get; }
        void AddDomainEvent(INotification domainEvent);
        void RemoveDomainEvent(INotification domainEvent);
        void ClearDomainEvents();
    }
}

