using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; }
        public required string EntityName { get; set; }
        public required string ActionType { get; set; } // Create, Update, Delete
        public required string OldValues { get; set; }
        public required string NewValues { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(ApplicationUser))]
        public Guid? UserId { get; set; }

        // Navigation property
        public ApplicationUser? User { get; set; }
    }
}

