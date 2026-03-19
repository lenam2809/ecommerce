using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Returns.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Returns.Queries.GetReturnRequests
{
    public class GetReturnRequestsQueryHandler
        : IRequestHandler<GetReturnRequestsQuery, Result<List<ReturnRequestListDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetReturnRequestsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ReturnRequestListDto>>> Handle(
            GetReturnRequestsQuery request, CancellationToken cancellationToken)
        {
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
