using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Dashboard.Dto;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Dashboard.Queries.GetCustomersByDate
{
    public class GetCustomersByDateQueryHandler : IRequestHandler<GetCustomersByDateQuery, Result<List<CustomersByDateDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;

        public GetCustomersByDateQueryHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<Result<List<CustomersByDateDto>>> Handle(GetCustomersByDateQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var endDate = DateTime.Today;
                var startDate = endDate.AddDays(-request.Days);

                // Lấy danh sách tất cả người dùng được tạo trong khoảng thời gian
                var users = await _unitOfWork.Users
                    .FindAsync(
                        u => u.CreatedAt >= startDate && u.CreatedAt <= endDate,
                        cancellationToken: cancellationToken);

                // Nhóm theo ngày và đếm
                var usersByDate = users
                    .GroupBy(u => u.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToDictionary(x => x.Date, x => x.Count);

                // Tạo danh sách các ngày trong khoảng thời gian
                var result = new List<CustomersByDateDto>();
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    usersByDate.TryGetValue(date.Date, out int newUsers);

                    result.Add(new CustomersByDateDto
                    {
                        Date = DateOnly.FromDateTime(date.Date),
                        NewUsers = newUsers
                    });
                }

                return Result<List<CustomersByDateDto>>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi lấy dữ liệu khách hàng theo ngày");
                return Result<List<CustomersByDateDto>>.BadRequest($"Lỗi khi lấy dữ liệu khách hàng: {ex.Message}");
            }
        }
    }
}

