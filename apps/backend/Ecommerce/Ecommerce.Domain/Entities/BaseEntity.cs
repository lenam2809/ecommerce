using Ecommerce.Domain.Interfaces.Base;
using MediatR;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public abstract class BaseEntity : IHasDomainEvents
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }

        public bool IsDeleted { get; set; } = false;

        [Timestamp]
        public byte[] ConcurrencyToken { get; set; } = [];

        private readonly List<INotification> _domainEvents = new();

        [NotMapped]
        public IReadOnlyCollection<INotification> DomainEvents => _domainEvents.AsReadOnly();

        public void AddDomainEvent(INotification domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void RemoveDomainEvent(INotification domainEvent)
        {
            _domainEvents.Remove(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }
    }
}

