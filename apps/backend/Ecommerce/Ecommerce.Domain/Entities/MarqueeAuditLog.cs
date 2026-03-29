using System.ComponentModel.DataAnnotations;

namespace Ecommerce.Domain.Entities
{
    public class MarqueeAuditLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Action { get; set; } = string.Empty;
        public string? OldData { get; set; }
        public string? NewData { get; set; }
        public string ChangedBy { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    }
}
