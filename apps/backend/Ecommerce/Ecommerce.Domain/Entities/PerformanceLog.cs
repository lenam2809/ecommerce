using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class PerformanceLog
    {
        public Guid Id { get; set; }
        public required string MethodName { get; set; }
        public required string ClassName { get; set; }
        public long ExecutionTimeMilliseconds { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey(nameof(ApplicationUser))]
        public Guid? UserId { get; set; }

        // Navigation property
        public ApplicationUser? User { get; set; }
    }
}

