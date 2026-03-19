using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetRecentTransactions
{
    public class GetRecentTransactionsQueryHandler : IRequestHandler<GetRecentTransactionsQuery, Result<List<RecentTransactionDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetRecentTransactionsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<RecentTransactionDto>>> Handle(GetRecentTransactionsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = request.EndDate ?? DateTime.Now;
                var startDate = request.StartDate ?? endDate.AddMonths(-1);

                var transactions = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status == Domain.Enums.EOrderStatus.Completed)
                            .Include(o => o.OrderItems)
                            .Include(o => o.ApplicationUser),
                        cancellationToken)
                    .ContinueWith(task => task.Result
                        .OrderByDescending(o => o.OrderDate)
                        .Take(request.Limit)
                        .Select(o => new RecentTransactionDto
                        {
                            CustomerName = o.ApplicationUser != null ? o.ApplicationUser.FullName : "Unknown",
                            CustomerEmail = o.ApplicationUser != null ? o.ApplicationUser.Email : "N/A",
                            Amount = o.OrderItems.Sum(oi => oi.Quantity * oi.UnitPrice),
                            OrderDate = o.OrderDate.ToString("yyyy-MM-dd HH:mm:ss")
                        })
                        .ToList(),
                        cancellationToken);

                return Result<List<RecentTransactionDto>>.Success(transactions);
            }
            catch (Exception ex)
            {
                return Result<List<RecentTransactionDto>>.BadRequest($"Lỗi khi lấy danh sách giao dịch gần đây: {ex.Message}");
            }
        }
    }
}

