using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequests
{
    public class GetReturnRequestsQueryHandler
        : IRequestHandler<GetReturnRequestsQuery, Result<List<ReturnRequestListDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public GetReturnRequestsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Result<List<ReturnRequestListDto>>> Handle(
            GetReturnRequestsQuery request, CancellationToken cancellationToken)
        {
            var currentUserId = _currentUserService.UserId;
            if (!currentUserId.HasValue)
            {
                return Result<List<ReturnRequestListDto>>.Unauthorized();
            }

            var canViewAll = _currentUserService.IsInRole(EUserRoles.Admin)
                             || _currentUserService.IsInRole(EUserRoles.Manager);
            if (!canViewAll)
            {
                if (request.OrderId.HasValue || request.Status.HasValue)
                {
                    return Result<List<ReturnRequestListDto>>.Forbidden("Bạn không có quyền xem danh sách đổi/trả này.");
                }

                if (request.CustomerId.HasValue && request.CustomerId.Value != currentUserId.Value)
                {
                    return Result<List<ReturnRequestListDto>>.Forbidden("Bạn không có quyền xem danh sách đổi/trả này.");
                }

                request.CustomerId = currentUserId.Value;
            }

            IReadOnlyList<ReturnRequest> entities;

            if (request.CustomerId.HasValue)
                entities = await _unitOfWork.ReturnRequests
                    .GetByCustomerIdAsync(request.CustomerId.Value, cancellationToken);
            else if (request.OrderId.HasValue)
                entities = await _unitOfWork.ReturnRequests
                    .GetByOrderIdAsync(request.OrderId.Value, cancellationToken);
            else if (request.Status.HasValue)
                entities = await _unitOfWork.ReturnRequests
                    .GetByStatusAsync(request.Status.Value, cancellationToken);
            else
            {
                var all = await _unitOfWork.ReturnRequests.GetAllAsync(cancellationToken);
                entities = all.ToList();
            }

            var dtos = entities.Select(e => new ReturnRequestListDto
            {
                Id = e.Id,
                Code = e.Code,
                OrderCode = e.Order?.Code ?? "",
                CustomerName = e.Customer?.FullName ?? "",
                Type = e.Type,
                TypeDisplay = e.Type.ToString(),
                Status = e.Status,
                StatusDisplay = e.Status.ToString(),
                Quantity = e.Quantity,
                RefundAmount = e.RefundAmount,
                CreatedAt = e.CreatedAt,
                ResolvedAt = e.ResolvedAt
            }).ToList();

            return Result<List<ReturnRequestListDto>>.Success(dtos);
        }
    }
}
