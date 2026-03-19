using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Base;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class ApplicationUser : IdentityUser<Guid>, IHasDomainEvents
    {
        [StringLength(50, MinimumLength = 2)]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Tên chỉ được chứa chữ cái và khoảng trắng")]
        public required string FirstName { get; set; }

        [StringLength(50, MinimumLength = 2)]
        [RegularExpression(@"^[a-zA-Z\s]+$", ErrorMessage = "Họ chỉ được chứa chữ cái và khoảng trắng")]
        public required string LastName { get; set; }

        public string FullName { get; set; } = string.Empty;

        [Url]
        public string Avatar { get; set; } = string.Empty;

        public ECustomerLevel CustomerLevel { get; set; } = ECustomerLevel.Bronze;

        public int PromotionPoints { get; set; } = 0;

        public EUserStatus Status { get; set; } = EUserStatus.Active;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastLogin { get; set; }

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

        // Navigation properties
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<ReviewLike> ReviewLikes { get; set; } = new List<ReviewLike>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }

}

