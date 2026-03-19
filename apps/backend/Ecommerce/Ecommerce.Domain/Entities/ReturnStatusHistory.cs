using System.ComponentModel.DataAnnotations;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Lịch sử thay đổi trạng thái của yêu cầu đổi/trả hàng (audit trail).
    /// </summary>
    public class ReturnStatusHistory : BaseEntity
    {
        public Guid ReturnRequestId { get; private set; }

        public EReturnStatus Status { get; private set; }

        [Required]
        [StringLength(1000)]
        public string Note { get; private set; } = string.Empty;

        public DateTime ChangedAt { get; private set; }

        // Navigation
        public virtual ReturnRequest ReturnRequest { get; private set; } = null!;

        // EF Core constructor
        private ReturnStatusHistory() { }

        public ReturnStatusHistory(Guid returnRequestId, EReturnStatus status, string note)
        {
            ReturnRequestId = returnRequestId;
            Status = status;
            Note = note;
            ChangedAt = DateTime.UtcNow;
        }
    }
}
