using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Orders.Queries.GetOrders
{
    [Authorize(Policy = EPermissions.ViewOrders)]
    public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, Result<PaginatedList<OrderDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public GetOrdersQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<Result<PaginatedList<OrderDto>>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Order, bool>> filter = order =>
                    (string.IsNullOrEmpty(request.SearchTerm)
                    || order.Code.Contains(request.SearchTerm)
                    || order.Email.Contains(request.SearchTerm)
                    || order.Phone.Contains(request.SearchTerm)
                    || order.ShippingAddress.Contains(request.SearchTerm)
                    ) &&
                    (string.IsNullOrWhiteSpace(request.Email) || order.Email == request.Email) &&
                    (string.IsNullOrWhiteSpace(request.Phone) || order.Phone == request.Phone) &&
                    (!request.UserId.HasValue || order.ApplicationUserId == request.UserId.Value) &&
                    (!request.Status.HasValue || order.Status == request.Status.Value) &&
                    (!request.StartDate.HasValue || order.OrderDate.Date >= request.StartDate.Value.Date) &&
                    (!request.EndDate.HasValue || order.OrderDate.Date <= request.EndDate.Value.Date) &&
                    (!request.MinTotalAmount.HasValue || order.TotalAmount >= request.MinTotalAmount.Value) &&
                    (!request.MaxTotalAmount.HasValue || order.TotalAmount <= request.MaxTotalAmount.Value);

                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                IOrderedQueryable<Order> orderBy(IQueryable<Order> query)
                {
                    return request.SortBy.ToLower() switch
                    {
                        "code" => request.IsDescending
                           ? query.OrderByDescending(o => o.Code)
                           : query.OrderBy(o => o.Code),
                        "orderdate" => request.IsDescending
                            ? query.OrderByDescending(o => o.OrderDate)
                            : query.OrderBy(o => o.OrderDate),
                        "totalamount" => request.IsDescending
                            ? query.OrderByDescending(o => o.TotalAmount)
                            : query.OrderBy(o => o.TotalAmount),
                        "status" => request.IsDescending
                            ? query.OrderByDescending(o => o.Status)
                            : query.OrderBy(o => o.Status),
                        _ => request.IsDescending
                            ? query.OrderByDescending(p => p.OrderDate)
                            : query.OrderBy(p => p.OrderDate)
                    };
                }

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Orders
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: query => query
                            .Include(p => p.OrderItems)
                            .Include(p => p.ApplicationUser)
                        );

                // Ánh xạ kết quả sang DTO
                var orderDtos = _mapper.Map<List<OrderDto>>(paginatedResult.Items);

                // Tạo kết quả trả về
                var result = new PaginatedList<OrderDto>(
                    orderDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                return Result<PaginatedList<OrderDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<OrderDto>>.BadRequest(ex.Message);
            }


        }
    }
}

