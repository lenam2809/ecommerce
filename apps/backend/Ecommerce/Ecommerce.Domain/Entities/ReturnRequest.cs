using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Exceptions;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Aggregate Root cho quy trình Đổi/Trả hàng (RMA - Return Merchandise Authorization).
    /// Quản lý toàn bộ lifecycle của một yêu cầu đổi/trả.
    /// </summary>
    public class ReturnRequest : BaseEntity
    {
        [Required]
        [StringLength(50)]
        public string Code { get; private set; } = string.Empty; // "RMA-260301-1234"

        [ForeignKey(nameof(Order))]
        public Guid OrderId { get; private set; }

        public Guid OrderItemId { get; private set; }

        [ForeignKey(nameof(Customer))]
        public Guid CustomerId { get; private set; }

        public EReturnType Type { get; private set; }
        public EReturnReason Reason { get; private set; }
        public EReturnStatus Status { get; private set; }

        [StringLength(2000)]
        public string CustomerNote { get; private set; } = string.Empty;

        [StringLength(2000)]
        public string? StaffNote { get; private set; }

        [StringLength(1000)]
        public string? RejectionReason { get; private set; }

        [Range(1, 1000)]
        public int Quantity { get; private set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundAmount { get; private set; }

        public Guid? ProcessedByStaffId { get; private set; }
        public DateTime? ResolvedAt { get; private set; }

        // Navigation properties
        public virtual Order Order { get; private set; } = null!;
        public virtual ApplicationUser Customer { get; private set; } = null!;

        private readonly List<ReturnEvidence> _evidences = new();
        public virtual IReadOnlyCollection<ReturnEvidence> Evidences => _evidences.AsReadOnly();

        private readonly List<ReturnStatusHistory> _statusHistory = new();
        public virtual IReadOnlyCollection<ReturnStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

        // EF Core constructor
        private ReturnRequest() { }

        public static ReturnRequest Create(
            Guid orderId, Guid orderItemId, Guid customerId,
            EReturnType type, EReturnReason reason,
            string customerNote, int quantity, decimal refundAmount)
        {
            if (quantity <= 0) throw new DomainException("Số lượng đổi/trả phải lớn hơn 0.");
            if (refundAmount < 0) throw new DomainException("Số tiền hoàn không được âm.");

            var request = new ReturnRequest
            {
                Code = GenerateRmaCode(),
                OrderId = orderId,
                OrderItemId = orderItemId,
                CustomerId = customerId,
                Type = type,
                Reason = reason,
                CustomerNote = customerNote,
                Quantity = quantity,
                RefundAmount = refundAmount,
                Status = EReturnStatus.Requested
            };

            request.AddStatusHistory(EReturnStatus.Requested, "Khách hàng gửi yêu cầu đổi/trả");
            request.AddDomainEvent(new ReturnRequestCreatedEvent(request.Id, request.Code, orderId, customerId));

            return request;
        }

        public void AddEvidence(string fileUrl, EEvidenceType fileType, string? description)
        {
            if (_evidences.Count >= 10)
                throw new DomainException("Tối đa 10 file bằng chứng cho mỗi yêu cầu đổi/trả.");
            _evidences.Add(ReturnEvidence.Create(this.Id, fileUrl, fileType, description));
        }

        public void StartReview(Guid staffId)
        {
            ValidateStatusTransition(EReturnStatus.UnderReview);
            Status = EReturnStatus.UnderReview;
            ProcessedByStaffId = staffId;
            AddStatusHistory(EReturnStatus.UnderReview, "Nhân viên bắt đầu xem xét");
        }

        public void Approve(Guid staffId, string? staffNote, decimal finalRefundAmount)
        {
            ValidateStatusTransition(EReturnStatus.Approved);
            Status = EReturnStatus.Approved;
            ProcessedByStaffId = staffId;
            StaffNote = staffNote;
            RefundAmount = finalRefundAmount;
            AddStatusHistory(EReturnStatus.Approved, staffNote ?? "Đã duyệt yêu cầu đổi/trả");
        }

        public void Reject(Guid staffId, string rejectionReason)
        {
            if (string.IsNullOrWhiteSpace(rejectionReason))
                throw new DomainException("Phải nêu lý do từ chối.");

            ValidateStatusTransition(EReturnStatus.Rejected);
            Status = EReturnStatus.Rejected;
            ProcessedByStaffId = staffId;
            RejectionReason = rejectionReason;
            ResolvedAt = DateTime.UtcNow;
            AddStatusHistory(EReturnStatus.Rejected, rejectionReason);
        }

        public void ConfirmItemReceived(string? note = null)
        {
            ValidateStatusTransition(EReturnStatus.ItemReceived);
            Status = EReturnStatus.ItemReceived;
            AddStatusHistory(EReturnStatus.ItemReceived, note ?? "Đã nhận hàng trả về");
        }

        public void StartQualityCheck(string? note = null)
        {
            ValidateStatusTransition(EReturnStatus.QualityCheck);
            Status = EReturnStatus.QualityCheck;
            AddStatusHistory(EReturnStatus.QualityCheck, note ?? "Đang kiểm tra chất lượng");
        }

        public void StartRefundProcessing(string? note = null)
        {
            ValidateStatusTransition(EReturnStatus.RefundProcessing);
            Status = EReturnStatus.RefundProcessing;
            AddStatusHistory(EReturnStatus.RefundProcessing, note ?? "Đang xử lý hoàn tiền");
        }

        public void StartExchangeProcessing(string? note = null)
        {
            ValidateStatusTransition(EReturnStatus.ExchangeProcessing);
            Status = EReturnStatus.ExchangeProcessing;
            AddStatusHistory(EReturnStatus.ExchangeProcessing, note ?? "Đang xử lý đổi hàng");
        }

        public void MarkCompleted(string? note = null)
        {
            ValidateStatusTransition(EReturnStatus.Completed);
            Status = EReturnStatus.Completed;
            ResolvedAt = DateTime.UtcNow;
            AddStatusHistory(EReturnStatus.Completed, note ?? "Hoàn tất xử lý đổi/trả");
            AddDomainEvent(new ReturnRequestCompletedEvent(Id, Code, OrderId, Type, RefundAmount));
        }

        private void AddStatusHistory(EReturnStatus status, string note)
        {
            _statusHistory.Add(new ReturnStatusHistory(this.Id, status, note));
        }

        private void ValidateStatusTransition(EReturnStatus newStatus)
        {
            if (!IsValidStatusTransition(Status, newStatus))
            {
                throw new DomainException(
                    $"Không thể chuyển trạng thái RMA từ '{Status}' sang '{newStatus}'.");
            }
        }

        private static bool IsValidStatusTransition(EReturnStatus current, EReturnStatus next)
        {
            if (current == next) return true;

            return (current, next) switch
            {
                (EReturnStatus.Requested, EReturnStatus.UnderReview) => true,
                (EReturnStatus.Requested, EReturnStatus.Rejected) => true,
                (EReturnStatus.UnderReview, EReturnStatus.Approved) => true,
                (EReturnStatus.UnderReview, EReturnStatus.Rejected) => true,
                (EReturnStatus.Approved, EReturnStatus.ItemReceived) => true,
                (EReturnStatus.ItemReceived, EReturnStatus.QualityCheck) => true,
                (EReturnStatus.QualityCheck, EReturnStatus.RefundProcessing) => true,
                (EReturnStatus.QualityCheck, EReturnStatus.ExchangeProcessing) => true,
                (EReturnStatus.QualityCheck, EReturnStatus.Rejected) => true,
                (EReturnStatus.RefundProcessing, EReturnStatus.Completed) => true,
                (EReturnStatus.ExchangeProcessing, EReturnStatus.Completed) => true,
                _ => false
            };
        }

        private static string GenerateRmaCode()
        {
            var timestamp = DateTime.Now.ToString("yyMMddHHmm");
            var random = new Random().Next(1000, 9999).ToString();
            return $"RMA-{timestamp}-{random}";
        }
    }
}
