using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.AuditLogs.Dto
{
    public class LogEntryDto
    {
        public Guid Id { get; set; }
        public DateTime Timestamp { get; set; }
        public ELogLevel Level { get; set; }
        public string LevelText { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public string SourceContext { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public Guid? ApplicationUserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public List<LogPropertyDto> Properties { get; set; } = [];
    }
}

