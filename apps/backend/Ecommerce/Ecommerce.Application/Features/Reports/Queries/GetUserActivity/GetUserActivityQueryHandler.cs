using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetUserActivity
{
    public class GetUserActivityQueryHandler : IRequestHandler<GetUserActivityQuery, Result<List<UserActivityDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetUserActivityQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<UserActivityDto>>> Handle(GetUserActivityQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var startDate = DateTime.Now.AddDays(-request.Days);
                var endDate = DateTime.Now;

                // Get daily logins
                //var loginActivities = await _unitOfWork.AuditLogs
                //    .GetAllWithIncludeAsync(
                //        query => query
                //            .Where(a => a.ActionType == EUserActivityType.Login &&
                //                   a.ActivityDate >= startDate &&
                //                   a.ActivityDate <= endDate),
                //        cancellationToken);

                // Get daily purchases
                var purchaseActivities = await _unitOfWork.Orders
                    .GetAllWithIncludeAsync(
                        query => query
                            .Where(o => o.Status == EOrderStatus.Completed &&
                                   o.OrderDate >= startDate &&
                                   o.OrderDate <= endDate),
                        cancellationToken);

                // Get daily page views (if tracking is implemented)
                //var pageViewActivities = await _unitOfWork.UserActivities
                //    .GetAllAsync(
                //        query => query
                //            .Where(a => a.ActivityType == EUserActivityType.PageView &&
                //                   a.ActivityDate >= startDate &&
                //                   a.ActivityDate <= endDate),
                //        cancellationToken);

                // Group by date and create result
                var result = Enumerable.Range(0, request.Days)
                    .Select(offset => startDate.AddDays(offset).Date)
                    .Select(date => new UserActivityDto
                    {
                        Date = date,
                        //Logins = loginActivities.Count(a => a.ActivityDate.Date == date),
                        Logins = 0,
                        Purchases = purchaseActivities.Count(o => o.OrderDate.Date == date),
                        //PageViews = pageViewActivities.Count(a => a.ActivityDate.Date == date)
                        PageViews = 0
                    })
                    .ToList();

                return Result<List<UserActivityDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<UserActivityDto>>.BadRequest($"Lỗi khi lấy hoạt động người dùng: {ex.Message}");
            }
        }
    }
}

