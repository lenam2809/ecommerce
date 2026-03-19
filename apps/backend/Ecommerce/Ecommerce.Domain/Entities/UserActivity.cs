using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class UserActivity : BaseEntity
    {

        [ForeignKey(nameof(ApplicationUser))]
        public Guid UserId { get; set; }

        public required string ActivityType { get; set; } // Login, Logout, ViewProduct, Purchase, etc.
        public required string Description { get; set; }
        public required string IpAddress { get; set; }
        public required string UserAgent { get; set; }
        public required string Location { get; set; } // Optional: địa điểm truy cập
        public DateTime Timestamp { get; set; } = DateTime.Now;
        public required string AdditionalData { get; set; } // JSON data for extra info

        // Navigation property
        public virtual ApplicationUser User { get; set; } = null!;
    }
}

