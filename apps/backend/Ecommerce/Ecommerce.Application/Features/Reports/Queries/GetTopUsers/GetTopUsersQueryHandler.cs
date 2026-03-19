using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetTopUsers
{
    public class GetTopUsersQueryHandler : IRequestHandler<GetTopUsersQuery, Result<List<TopUserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetTopUsersQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<TopUserDto>>> Handle(GetTopUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = request.StartDate ?? DateTime.Now.AddYears(-1);
                var endDate = request.EndDate ?? DateTime.Now;

                var users = await _unitOfWork.Users
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(u => u.Orders)
                                .ThenInclude(o => o.OrderItems)
                            .Where(u => u.Orders.Any(o =>
                                o.OrderDate >= startDate &&
                                o.OrderDate <= endDate &&
                                o.Status == EOrderStatus.Completed)),
                        cancellationToken);

                var topUsers = users
                    .Select(u => new TopUserDto
                    {
                        UserId = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        TotalSpent = u.Orders
                            .Where(o => o.Status == EOrderStatus.Completed)
                            .Sum(o => o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice)),
                        OrderCount = u.Orders
                            .Where(o => o.Status == EOrderStatus.Completed)
                            .Count(),
                        LastActivity = u.Orders
                            .Where(o => o.Status == EOrderStatus.Completed)
                            .Max(o => o.OrderDate),
                        CustomerLevel = u.CustomerLevel
                    })
                    .OrderByDescending(u =>
                        request.OrderBy == "TotalSpent" ? u.TotalSpent :
                        request.OrderBy == "OrderCount" ? u.OrderCount :
                        u.LastActivity.Ticks)
                    .Take(request.TopN)
                    .ToList();

                return Result<List<TopUserDto>>.Success(topUsers);
            }
            catch (Exception ex)
            {
                return Result<List<TopUserDto>>.BadRequest($"Lỗi khi lấy danh sách người dùng hàng đầu: {ex.Message}");
            }
        }
    }
}

