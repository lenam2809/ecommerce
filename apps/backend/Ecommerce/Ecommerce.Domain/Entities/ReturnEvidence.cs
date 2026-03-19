using System.ComponentModel.DataAnnotations;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Domain.Entities
{
    /// <summary>
    /// Bằng chứng đổi/trả hàng (ảnh/video sản phẩm lỗi).
    /// </summary>
    public class ReturnEvidence : BaseEntity
    {
        public Guid ReturnRequestId { get; private set; }

        [Required]
        [StringLength(1000)]
        public string FileUrl { get; private set; } = string.Empty;

        public EEvidenceType FileType { get; private set; }

        [StringLength(500)]
        public string? Description { get; private set; }

        // Navigation
        public virtual ReturnRequest ReturnRequest { get; private set; } = null!;

        // EF Core constructor
        private ReturnEvidence() { }

        public static ReturnEvidence Create(Guid returnRequestId, string fileUrl,
            EEvidenceType fileType, string? description)
        {
            return new ReturnEvidence
            {
                ReturnRequestId = returnRequestId,
                FileUrl = fileUrl,
                FileType = fileType,
                Description = description
            };
        }
    }
}
