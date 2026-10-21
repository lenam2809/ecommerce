using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById
{
    public class GetReturnRequestByIdQueryHandler
        : IRequestHandler<GetReturnRequestByIdQuery, Result<ReturnRequestDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public GetReturnRequestByIdQueryHandler(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<ReturnRequestDto>> Handle(
            GetReturnRequestByIdQuery request, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.Id, cancellationToken);

            if (entity is null)
                return Result<ReturnRequestDto>.NotFound("Yêu cầu đổi/trả không tồn tại.");

            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
            {
                return Result<ReturnRequestDto>.Unauthorized();
            }

            var canViewAll = _currentUserService.IsInRole(EUserRoles.Admin)
                             || _currentUserService.IsInRole(EUserRoles.Manager);
            if (!canViewAll && entity.CustomerId != currentUserId.Value)
            {
                return Result<ReturnRequestDto>.Forbidden("Bạn không có quyền xem yêu cầu đổi/trả này.");
            }

            var typeDisplay = entity.Type switch
            {
                EReturnType.Exchange => "Đổi mới 1 đổi 1 (Chính sách 30 ngày)",
                EReturnType.Return => "Trả hàng hoàn tiền",
                _ => entity.Type.ToString()
            };

            var reasonDisplay = entity.Reason switch
            {
                EReturnReason.Defective => "Lỗi phần cứng NSX (Đã xác nhận bởi KTV)",
                EReturnReason.WrongItem => "Giao sai sản phẩm / sai màu sắc / sai phiên bản",
                EReturnReason.DamagedInShipping => "Hư hỏng / móp méo trong quá trình vận chuyển",
                EReturnReason.NotAsDescribed => "Sản phẩm không đúng mô tả thông số kỹ thuật",
                EReturnReason.ChangedMind => "Khách hàng đổi ý trong thời hạn chính sách",
                _ => "Lý do khác"
            };

            var statusDisplay = entity.Status switch
            {
                EReturnStatus.Requested => "Bước 1/5: Đã gửi yêu cầu đổi/trả trực tuyến",
                EReturnStatus.UnderReview => "Bước 2/5: Đang xem xét & chuẩn bị tiếp nhận",
                EReturnStatus.Approved => "Bước 2/5: Đã duyệt tiếp nhận tại Showroom",
                EReturnStatus.ItemReceived => "Bước 2/5: Đã tiếp nhận thiết bị tại quầy VIP Showroom",
                EReturnStatus.QualityCheck => "Bước 3/5: Kỹ thuật viên đang kiểm định & đo kiểm phần cứng",
                EReturnStatus.RefundProcessing => "Bước 4/5: Đang thực hiện thủ tục hoàn tiền",
                EReturnStatus.ExchangeProcessing => "Bước 4/5: Đang xuất kho thiết bị mới nguyên seal",
                EReturnStatus.Completed => "Bước 5/5: Đã bàn giao thiết bị mới & Hoàn tất hồ sơ bảo hành",
                EReturnStatus.Rejected => "Đã từ chối yêu cầu đổi/trả",
                _ => entity.Status.ToString()
            };

            var dto = new ReturnRequestDto
            {
                Id = entity.Id,
                Code = entity.Code,
                OrderId = entity.OrderId,
                OrderCode = entity.Order?.Code ?? "",
                OrderItemId = entity.OrderItemId,
                CustomerId = entity.CustomerId,
                CustomerName = entity.Customer?.FullName ?? "",
                CustomerEmail = entity.Customer?.Email ?? "",
                Type = entity.Type,
                TypeDisplay = typeDisplay,
                Reason = entity.Reason,
                ReasonDisplay = reasonDisplay,
                Status = entity.Status,
                StatusDisplay = statusDisplay,
                CustomerNote = entity.CustomerNote,
                StaffNote = entity.StaffNote,
                RejectionReason = entity.RejectionReason,
                Quantity = entity.Quantity,
                RefundAmount = entity.RefundAmount,
                ProcessedByStaffId = entity.ProcessedByStaffId,
                CreatedAt = entity.CreatedAt,
                ResolvedAt = entity.ResolvedAt,
                SerialNumber = entity.SerialNumber,
                ShowroomId = entity.ShowroomId,
                ShowroomName = entity.Showroom?.Name,
                ShowroomAddress = entity.Showroom?.Address,
                AssignedTechnicianName = entity.AssignedTechnicianName,
                ProcessingMethod = entity.ProcessingMethod ?? (entity.ShowroomId.HasValue ? "Đổi lấy ngay 15 phút tại 45 Showroom" : "Gửi qua đường bưu điện"),
                Evidences = entity.Evidences.Select(e => new ReturnEvidenceDto
                {
                    Id = e.Id,
                    FileUrl = e.FileUrl,
                    FileType = e.FileType,
                    Description = e.Description
                }).ToList(),
                StatusHistory = entity.StatusHistory.Select(h => new ReturnStatusHistoryDto
                {
                    Status = h.Status,
                    StatusDisplay = h.Status.ToString(),
                    Note = h.Note,
                    ChangedAt = h.ChangedAt
                }).OrderByDescending(h => h.ChangedAt).ToList()
            };

            // Build 5-step timeline progress
            dto.TimelineSteps = Build5StepTimeline(entity);

            // Populate Logs (Nhật ký kỹ thuật viên)
            if (entity.Logs != null && entity.Logs.Any())
            {
                dto.Logs = entity.Logs.Select(l => new ReturnRequestLogDto
                {
                    Id = l.Id,
                    Step = l.Step,
                    Action = l.Action,
                    Title = l.Title,
                    ActorName = l.ActorName,
                    Location = l.Location,
                    Note = l.Note,
                    ProcessingMethod = l.ProcessingMethod,
                    LoggedAt = l.LoggedAt
                }).OrderBy(l => l.Step).ThenBy(l => l.LoggedAt).ToList();
            }
            else
            {
                // Fallback / default generated technician logs based on status
                dto.Logs = GenerateLogsFromStatus(entity);
            }

            return Result<ReturnRequestDto>.Success(dto);
        }

        private static List<ReturnTimelineStepDto> Build5StepTimeline(ReturnRequest entity)
        {
            var currentStatus = entity.Status;
            var isRejected = currentStatus == EReturnStatus.Rejected;

            // Determine status for each of the 5 standard steps
            // Step 1: Khởi tạo yêu cầu trực tuyến
            // Step 2: Tiếp nhận thiết bị tại showroom / bưu điện
            // Step 3: KTV kiểm định phần cứng & xác nhận lỗi NSX
            // Step 4: Duyệt xuất máy mới / Hoàn tiền
            // Step 5: Bàn giao thiết bị & Hoàn tất hồ sơ bảo hành

            int currentStep = currentStatus switch
            {
                EReturnStatus.Requested => 1,
                EReturnStatus.UnderReview => 2,
                EReturnStatus.Approved => 2,
                EReturnStatus.ItemReceived => 2,
                EReturnStatus.QualityCheck => 3,
                EReturnStatus.ExchangeProcessing => 4,
                EReturnStatus.RefundProcessing => 4,
                EReturnStatus.Completed => 5,
                EReturnStatus.Rejected => 2,
                _ => 1
            };

            var steps = new List<ReturnTimelineStepDto>
            {
                new()
                {
                    Step = 1,
                    Title = "Bước 1: Khởi tạo yêu cầu đổi/trả trực tuyến",
                    Description = "Khách hàng gửi yêu cầu kèm hình ảnh/video mô tả lỗi.",
                    Status = currentStep >= 1 ? "Completed" : "Pending",
                    CompletedAt = entity.CreatedAt,
                    Actor = entity.Customer?.FullName ?? "Khách hàng"
                },
                new()
                {
                    Step = 2,
                    Title = "Bước 2: Tiếp nhận thiết bị & đối chiếu Serial/IMEI",
                    Description = entity.Showroom != null ? $"Tiếp nhận tại Quầy VIP {entity.Showroom.Name}" : "Tiếp nhận thiết bị tại Showroom / Trung tâm bảo hành.",
                    Status = currentStep > 2 || (currentStep == 2 && currentStatus == EReturnStatus.ItemReceived) ? "Completed"
                           : currentStep == 2 ? "Active" : "Pending",
                    Location = entity.Showroom?.Address ?? "Hệ thống 45 Showroom toàn quốc"
                },
                new()
                {
                    Step = 3,
                    Title = "Bước 3: KTV kiểm định phần cứng & chẩn đoán lỗi NSX",
                    Description = "Kỹ thuật viên đo kiểm bằng máy chuyên dụng, xác thực điều kiện 1 đổi 1.",
                    Status = currentStep > 3 ? "Completed"
                           : currentStep == 3 ? "Active" : "Pending",
                    Actor = entity.AssignedTechnicianName ?? "Kỹ thuật viên trưởng"
                },
                new()
                {
                    Step = 4,
                    Title = "Bước 4: Phê duyệt giải pháp & Xuất máy mới",
                    Description = entity.Type == EReturnType.Exchange ? "Duyệt xuất máy mới 100% nguyên seal." : "Duyệt lệnh hoàn tiền vào tài khoản khách hàng.",
                    Status = currentStep > 4 ? "Completed"
                           : currentStep == 4 ? "Active" : "Pending"
                },
                new()
                {
                    Step = 5,
                    Title = "Bước 5: Bàn giao thiết bị & Cập nhật bảo hành điện tử",
                    Description = "Bàn giao máy mới nguyên seal, kích hoạt e-Warranty 24 tháng.",
                    Status = currentStep == 5 && currentStatus == EReturnStatus.Completed ? "Completed"
                           : currentStep == 5 ? "Active" : "Pending",
                    CompletedAt = entity.ResolvedAt
                }
            };

            return steps;
        }

        private static List<ReturnRequestLogDto> GenerateLogsFromStatus(ReturnRequest entity)
        {
            var logs = new List<ReturnRequestLogDto>();

            logs.Add(new ReturnRequestLogDto
            {
                Id = Guid.NewGuid(),
                Step = 1,
                Action = "CREATE_REQUEST",
                Title = "Khởi tạo yêu cầu đổi/trả trực tuyến",
                ActorName = entity.Customer?.FullName ?? "Khách hàng",
                Location = "Website ShopViet",
                Note = entity.CustomerNote,
                ProcessingMethod = entity.ProcessingMethod ?? "Đổi lấy ngay 15 phút tại 45 Showroom",
                LoggedAt = entity.CreatedAt
            });

            if (entity.Status >= EReturnStatus.ItemReceived)
            {
                logs.Add(new ReturnRequestLogDto
                {
                    Id = Guid.NewGuid(),
                    Step = 2,
                    Action = "RECEIVE_ITEM",
                    Title = "Tiếp nhận thiết bị tại quầy VIP",
                    ActorName = entity.AssignedTechnicianName ?? "KTV ShopViet",
                    Location = entity.Showroom?.Name ?? "Showroom Flagship Lê Lợi, Q.1",
                    Note = $"Đã đối chiếu Serial/IMEI {entity.SerialNumber ?? "Hợp lệ"} trên hệ thống e-Warranty ShopViet.",
                    ProcessingMethod = "Đổi lấy ngay 15 phút tại 45 Showroom",
                    LoggedAt = entity.CreatedAt.AddMinutes(15)
                });
            }

            if (entity.Status >= EReturnStatus.QualityCheck || !string.IsNullOrWhiteSpace(entity.StaffNote))
            {
                logs.Add(new ReturnRequestLogDto
                {
                    Id = Guid.NewGuid(),
                    Step = 3,
                    Action = "HARDWARE_DIAGNOSTIC",
                    Title = "Kiểm định kỹ thuật phần cứng & Xác nhận lỗi NSX",
                    ActorName = entity.AssignedTechnicianName ?? "KTV Trưởng",
                    Location = entity.Showroom?.Name ?? "Trung tâm kỹ thuật Showroom",
                    Note = entity.StaffNote ?? "Đo kiểm hoàn tất trong 10 phút, xác nhận thiết bị đủ điều kiện 1 đổi 1.",
                    ProcessingMethod = "Đo kiểm bằng thiết bị chuyên dụng",
                    LoggedAt = entity.CreatedAt.AddMinutes(25)
                });
            }

            if (entity.Status >= EReturnStatus.ExchangeProcessing || entity.Status >= EReturnStatus.RefundProcessing)
            {
                logs.Add(new ReturnRequestLogDto
                {
                    Id = Guid.NewGuid(),
                    Step = 4,
                    Action = "APPROVE_SOLUTION",
                    Title = entity.Type == EReturnType.Exchange ? "Duyệt xuất kho máy mới 1 đổi 1" : "Duyệt lệnh hoàn tiền",
                    ActorName = "Quản lý Showroom",
                    Location = entity.Showroom?.Name ?? "Showroom",
                    Note = entity.Type == EReturnType.Exchange ? "Đã duyệt xuất kho 1 thiết bị mới 100% nguyên seal." : $"Đã duyệt hoàn tiền {entity.RefundAmount:N0}₫.",
                    ProcessingMethod = "Xuất kho tự động",
                    LoggedAt = entity.CreatedAt.AddMinutes(35)
                });
            }

            if (entity.Status == EReturnStatus.Completed)
            {
                logs.Add(new ReturnRequestLogDto
                {
                    Id = Guid.NewGuid(),
                    Step = 5,
                    Action = "HANDOVER_COMPLETED",
                    Title = "Bàn giao thiết bị & Kích hoạt bảo hành điện tử",
                    ActorName = entity.AssignedTechnicianName ?? "KTV ShopViet",
                    Location = entity.Showroom?.Name ?? "Showroom",
                    Note = "Khách hàng đã nhận thiết bị mới nguyên seal, ký nhận biên bản bảo hành điện tử 24 tháng.",
                    ProcessingMethod = "Bàn giao tại quầy",
                    LoggedAt = entity.ResolvedAt ?? entity.CreatedAt.AddMinutes(45)
                });
            }

            return logs;
        }
    }
}
