using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Brands.Queries.GetOptionUsers;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Users.Queries.GetOptionUsers
{
    public class GetOptionUsersQueryHandler : IRequestHandler<GetOptionUsersQuery, Result<List<Option>>>
    {
        private readonly IUserRepository _repository;
        private readonly ICacheService _cacheService;

        public GetOptionUsersQueryHandler(IUserRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<List<Option>>> Handle(GetOptionUsersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = $"get_option_users";

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<Option>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<Option>>.Success(cachedResult);
                }

                var users = await _repository.GetAllAsync(cancellationToken);

                // Transform categories into options
                var options = users.Select(c => new Option
                {
                    Value = c.Id.ToString(),
                    Label = c.FullName ?? c.Email,
                    Disabled = false // You could add logic to disable certain categories if needed
                }).ToList();

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, options, TimeSpan.FromMinutes(10));

                return Result<List<Option>>.Success(options);
            }
            catch (Exception ex)
            {
                return Result<List<Option>>.BadRequest(ex.Message);
            }

        }
    }
}

