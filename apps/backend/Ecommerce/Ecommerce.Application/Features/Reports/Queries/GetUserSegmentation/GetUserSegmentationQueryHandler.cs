using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Reports.Queries.GetUserSegmentation
{
    public class GetUserSegmentationQueryHandler : IRequestHandler<GetUserSegmentationQuery, Result<List<UserSegmentationDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetUserSegmentationQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<UserSegmentationDto>>> Handle(GetUserSegmentationQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var users = await _unitOfWork.Users.GetAllWithIncludeAsync(
                    query => query.Where(u =>
                        request.IncludeInactive || u.Status == EUserStatus.Active),
                    cancellationToken);

                var totalUsers = users.Count();
                if (totalUsers == 0)
                {
                    return Result<List<UserSegmentationDto>>.Success(new List<UserSegmentationDto>());
                }

                // Segment by customer level
                var segments = new List<UserSegmentationDto>
                {
                    new() { Segment = "Đồng", Count = users.Count(u => u.CustomerLevel == ECustomerLevel.Bronze) },
                    new() { Segment = "Bạc", Count = users.Count(u => u.CustomerLevel == ECustomerLevel.Silver) },
                    new() { Segment = "Vàng", Count = users.Count(u => u.CustomerLevel == ECustomerLevel.Gold) },
                    new() { Segment = "Kim cương", Count = users.Count(u => u.CustomerLevel == ECustomerLevel.Diamond) }
                };

                // Calculate percentages
                foreach (var segment in segments)
                {
                    segment.Percentage = (decimal)segment.Count / totalUsers;
                }

                return Result<List<UserSegmentationDto>>.Success(segments);
            }
            catch (Exception ex)
            {
                return Result<List<UserSegmentationDto>>.BadRequest($"Lỗi khi lấy phân khúc người dùng: {ex.Message}");
            }
        }
    }
}

