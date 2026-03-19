using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetAbouts
{
    public class GetAboutsQueryHandler : IRequestHandler<GetAboutsQuery, Result<List<AboutDto>>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;


        public GetAboutsQueryHandler(IRepository<Ecommerce.Domain.Entities.About> repository,
            IMapper mapper,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<List<AboutDto>>> Handle(GetAboutsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = CacheKeys.GetAbouts();

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<List<AboutDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<List<AboutDto>>.Success(cachedResult);
                }

                var abouts = await _repository.GetAllAsync(cancellationToken);

                var result = _mapper.Map<List<AboutDto>>(abouts);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<List<AboutDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<AboutDto>>.BadRequest(ex.Message);
            }
        }
    }
}

