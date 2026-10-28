using System;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Returns.Commands.AddReturnRequestLog
{
    /// <summary>
    /// Command ghi nhận nhật ký kiểm định RMA 5 bước theo chuẩn SSoT 2026:
    /// Step 1: Tiếp nhận yêu cầu & Kiểm tra Serial (RequestReceived)
    /// Step 2: Nhận máy tại Showroom / Bưu cục (ReceivedAtShowroom)
    /// Step 3: Kỹ thuật viên thẩm định phần cứng (TechnicianInspection)
    /// Step 4: Xử lý Đổi máy mới 15 phút tại Showroom / Lên lệnh Hoàn tiền (ResolutionProcessing)
    /// Step 5: Hoàn tất RMA & Đóng hồ sơ (Completed)
    /// </summary>
    public class AddReturnRequestLogCommand : ICommand<Result<ReturnRequestLogDto>>
    {
        public Guid ReturnRequestId { get; set; }
        public int Step { get; set; } = 1;
        public string? Action { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ActorName { get; set; }
        public string? Location { get; set; }
        public string? Note { get; set; }
        public string? ProcessingMethod { get; set; }

        // Cập nhật thông tin thiết bị & kỹ thuật viên liên quan
        public string? SerialNumber { get; set; }
        public Guid? ShowroomId { get; set; }
        public string? AssignedTechnicianName { get; set; }
        public EReturnStatus? AdvanceStatus { get; set; }
    }
}
