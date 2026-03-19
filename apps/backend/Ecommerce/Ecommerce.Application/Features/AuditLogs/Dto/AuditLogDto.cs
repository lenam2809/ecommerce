namespace Ecommerce.Application.Features.AuditLogs.Dto
{
    public class AuditLogDto
    {
        public Guid Id { get; set; }
        public required string EntityName { get; set; }
        public required string ActionType { get; set; }
        public required string OldValues { get; set; }
        public required string NewValues { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? UserId { get; set; }
        public required string UserName { get; set; } // Tên người dùng thực hiện hành động
    }
}

