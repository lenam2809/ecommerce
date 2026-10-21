using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Returns.Dto
{
    public class ReturnRequestDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public Guid OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public Guid OrderItemId { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;

        public EReturnType Type { get; set; }
        public string TypeDisplay { get; set; } = string.Empty;
        public EReturnReason Reason { get; set; }
        public string ReasonDisplay { get; set; } = string.Empty;
        public EReturnStatus Status { get; set; }
        public string StatusDisplay { get; set; } = string.Empty;

        public string CustomerNote { get; set; } = string.Empty;
        public string? StaffNote { get; set; }
        public string? RejectionReason { get; set; }
        public int Quantity { get; set; }
        public decimal RefundAmount { get; set; }
        public Guid? ProcessedByStaffId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        public string? SerialNumber { get; set; }
        public Guid? ShowroomId { get; set; }
        public string? ShowroomName { get; set; }
        public string? ShowroomAddress { get; set; }
        public string? AssignedTechnicianName { get; set; }
        public string? ProcessingMethod { get; set; }

        public List<ReturnEvidenceDto> Evidences { get; set; } = [];
        public List<ReturnStatusHistoryDto> StatusHistory { get; set; } = [];
        public List<ReturnRequestLogDto> Logs { get; set; } = [];
        public List<ReturnTimelineStepDto> TimelineSteps { get; set; } = [];
    }

    public class ReturnEvidenceDto
    {
        public Guid Id { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public EEvidenceType FileType { get; set; }
        public string? Description { get; set; }
    }

    public class ReturnStatusHistoryDto
    {
        public EReturnStatus Status { get; set; }
        public string StatusDisplay { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
    }

    public class ReturnRequestLogDto
    {
        public Guid Id { get; set; }
        public int Step { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? ActorName { get; set; }
        public string? Author => ActorName;
        public string? Location { get; set; }
        public string? Note { get; set; }
        public string? TechnicianNote => Note;
        public string? ProcessingMethod { get; set; }
        public DateTime LoggedAt { get; set; }
    }

    public class ReturnTimelineStepDto
    {
        public int Step { get; set; } // 1 to 5
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // "Completed", "Active", "Pending"
        public DateTime? CompletedAt { get; set; }
        public string? Actor { get; set; }
        public string? Location { get; set; }
    }

    public class ReturnRequestListDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public EReturnType Type { get; set; }
        public string TypeDisplay { get; set; } = string.Empty;
        public EReturnStatus Status { get; set; }
        public string StatusDisplay { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal RefundAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }
}
