using Ecommerce.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecommerce.Domain.Entities
{
    public class LogEntry
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public ELogLevel Level { get; set; }
        public required string Message { get; set; }
        public required string EventName { get; set; }
        public required string SourceContext { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public List<LogProperty> Properties { get; set; } = new List<LogProperty>();

        // Navigation property for optional user context
        [ForeignKey(nameof(ApplicationUser))]
        public Guid? ApplicationUserId { get; set; }
        public ApplicationUser? User { get; set; }
    }

    public class LogProperty
    {
        public Guid Id { get; set; } // Khóa chính
        public Guid LogEntryId { get; set; } // Khóa ngoại
        public required string Key { get; set; }
        public required string Value { get; set; } // Lưu mọi giá trị dưới dạng chuỗi
    }

}

