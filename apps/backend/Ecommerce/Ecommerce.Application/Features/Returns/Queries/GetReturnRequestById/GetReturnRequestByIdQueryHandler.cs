using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequestById
{
    public class GetReturnRequestByIdQueryHandler
        : IRequestHandler<GetReturnRequestByIdQuery, Result<ReturnRequestDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetReturnRequestByIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<ReturnRequestDto>> Handle(
            GetReturnRequestByIdQuery request, CancellationToken cancellationToken)
        {
            var entity = await _unitOfWork.ReturnRequests
                .GetWithDetailsAsync(request.Id, cancellationToken);

            if (entity is null)
                return Result<ReturnRequestDto>.NotFound("Yêu cầu đổi/trả không tồn tại.");

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
                TypeDisplay = entity.Type.ToString(),
                Reason = entity.Reason,
                ReasonDisplay = entity.Reason.ToString(),
                Status = entity.Status,
                StatusDisplay = entity.Status.ToString(),
                CustomerNote = entity.CustomerNote,
                StaffNote = entity.StaffNote,
                RejectionReason = entity.RejectionReason,
                Quantity = entity.Quantity,
                RefundAmount = entity.RefundAmount,
                ProcessedByStaffId = entity.ProcessedByStaffId,
                CreatedAt = entity.CreatedAt,
                ResolvedAt = entity.ResolvedAt,
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

            return Result<ReturnRequestDto>.Success(dto);
        }
    }
}
