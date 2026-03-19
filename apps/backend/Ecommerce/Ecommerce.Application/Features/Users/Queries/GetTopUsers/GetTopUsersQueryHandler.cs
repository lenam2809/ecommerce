using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Users.Dto;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Users.Queries.GetTopUsers
{
    public class GetTopUsersQueryHandler : IRequestHandler<GetTopUsersQuery, Result<List<UserDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileService;
        private readonly ICacheService _cacheService;


        public GetTopUsersQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileService,
            ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileService = fileService;
            _cacheService = cacheService;
        }

        public async Task<Result<List<UserDto>>> Handle(GetTopUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {

                // Tạo cache key dựa trên thông tin người dùng hiện tại và bộ lọc
                string cacheKey = $"top_users";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<UserDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<UserDto>>.Success(cachedResult);
                }

                // Lấy tất cả người dùng kèm theo thông tin đơn hàng
                var users = await _unitOfWork.Users
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(u => u.Orders),
                        cancellationToken: cancellationToken);

                // Tính toán tổng chi tiêu cho mỗi người dùng và sắp xếp giảm dần
                var topUsers = users
                    .Select(u => new
                    {
                        User = u,
                        TotalSpent = u.Orders.Sum(o => o.TotalAmount)
                    })
                    .Where(y => y.TotalSpent > 0)
                    .OrderByDescending(x => x.TotalSpent)
                    .Take(10)
                    .ToList();

                // Ánh xạ sang DTO
                var userDtos = _mapper.Map<List<UserDto>>(topUsers.Select(x => x.User));

                // Cập nhật thông tin bổ sung cho mỗi người dùng
                foreach (var userDto in userDtos)
                {
                    var user = topUsers.FirstOrDefault(x => x.User.Id == userDto.Id)?.User;
                    if (user != null)
                    {
                        userDto.Avatar = await _fileService.GetFileUrlAsync(userDto.Avatar);

                        var orders = user.Orders.ToList();
                        userDto.OrderCount = orders.Count();
                        userDto.TotalSpent = orders.Sum(o => o.TotalAmount);
                        userDto.LastOrder = orders
                            .Select(o => o.CreatedAt)
                            .OrderByDescending(d => d)
                            .FirstOrDefault();
                    }
                }

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, userDtos, TimeSpan.FromMinutes(10));

                return Result<List<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                return Result<List<UserDto>>.BadRequest(ex.Message);
            }
        }
    }
}
