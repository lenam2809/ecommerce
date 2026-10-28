using System;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Commands.AddReturnRequestLog
{
    public class AddReturnRequestLogCommandHandler
        : IRequestHandler<AddReturnRequestLogCommand, Result<ReturnRequestLogDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public AddReturnRequestLogCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<ReturnRequestLogDto>> Handle(
            AddReturnRequestLogCommand request, CancellationToken cancellationToken)
        {
            var returnRequest = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.ReturnRequestId, cancellationToken);

            if (returnRequest == null)
            {
                return Result<ReturnRequestLogDto>.NotFound("Yêu cầu đổi/trả không tồn tại.");
            }

            // Cập nhật thông tin thiết bị & kỹ thuật viên liên quan
            if (!string.IsNullOrWhiteSpace(request.AssignedTechnicianName))
            {
                returnRequest.AssignedTechnicianName = request.AssignedTechnicianName.Trim();
            }

            if (request.ShowroomId.HasValue && request.ShowroomId.Value != Guid.Empty)
            {
                returnRequest.ShowroomId = request.ShowroomId.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.ProcessingMethod))
            {
                returnRequest.ProcessingMethod = request.ProcessingMethod.Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.SerialNumber))
            {
                returnRequest.SerialNumber = request.SerialNumber.Trim();
            }

            // Tùy chọn chuyển trạng thái nếu được yêu cầu
            if (request.AdvanceStatus.HasValue)
            {
                try
                {
                    switch (request.AdvanceStatus.Value)
                    {
                        case EReturnStatus.ItemReceived:
                            returnRequest.ConfirmItemReceived(request.Note);
                            break;
                        case EReturnStatus.QualityCheck:
                            returnRequest.StartQualityCheck(request.Note);
                            break;
                        case EReturnStatus.RefundProcessing:
                            returnRequest.StartRefundProcessing(request.Note);
                            break;
                        case EReturnStatus.ExchangeProcessing:
                            returnRequest.StartExchangeProcessing(request.Note);
                            break;
                        case EReturnStatus.Completed:
                            returnRequest.MarkCompleted(request.Note);
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.Log(ELogLevel.Warning, $"Không thể tự động chuyển trạng thái RMA sang {request.AdvanceStatus.Value}: {ex.Message}", "AddReturnRequestLog");
                }
            }

            var defaultAction = request.Step switch
            {
                1 => "RequestReceived",
                2 => "ReceivedAtShowroom",
                3 => "TechnicianInspection",
                4 => "ResolutionProcessing",
                5 => "Completed",
                _ => "LogEntry"
            };

            var defaultTitle = request.Step switch
            {
                1 => "Tiếp nhận yêu cầu & Kiểm tra Serial",
                2 => "Nhận máy tại Showroom / Bưu cục",
                3 => "Kỹ thuật viên thẩm định phần cứng",
                4 => "Xử lý Đổi máy mới 15 phút tại Showroom / Lên lệnh Hoàn tiền",
                5 => "Hoàn tất RMA & Đóng hồ sơ",
                _ => "Ghi nhận nhật ký kiểm định"
            };

            var log = new ReturnRequestLog
            {
                ReturnRequestId = returnRequest.Id,
                Step = request.Step,
                Action = string.IsNullOrWhiteSpace(request.Action) ? defaultAction : request.Action.Trim(),
                Title = string.IsNullOrWhiteSpace(request.Title) ? defaultTitle : request.Title.Trim(),
                ActorName = !string.IsNullOrWhiteSpace(request.ActorName)
                    ? request.ActorName.Trim()
                    : (!string.IsNullOrWhiteSpace(request.AssignedTechnicianName) ? request.AssignedTechnicianName.Trim() : "Kỹ thuật viên"),
                Location = !string.IsNullOrWhiteSpace(request.Location)
                    ? request.Location.Trim()
                    : (returnRequest.Showroom?.Name ?? "Showroom tiếp nhận"),
                Note = request.Note?.Trim(),
                ProcessingMethod = !string.IsNullOrWhiteSpace(request.ProcessingMethod)
                    ? request.ProcessingMethod.Trim()
                    : returnRequest.ProcessingMethod,
                LoggedAt = DateTime.UtcNow
            };

            returnRequest.Logs.Add(log);
            await _unitOfWork.CompleteAsync(cancellationToken);

            var dto = new ReturnRequestLogDto
            {
                Id = log.Id,
                Step = log.Step,
                Action = log.Action,
                Title = log.Title,
                ActorName = log.ActorName,
                Location = log.Location,
                Note = log.Note,
                ProcessingMethod = log.ProcessingMethod,
                LoggedAt = log.LoggedAt
            };

            return Result<ReturnRequestLogDto>.Success(dto);
        }
    }
}
