using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.About.Dto;
using Ecommerce.Domain.Interfaces.Base;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.About.Queries.GetAboutById
{
    public class GetAboutByIdQueryHandler : IRequestHandler<GetAboutByIdQuery, Result<AboutDto>>
    {
        private readonly IRepository<Ecommerce.Domain.Entities.About> _repository;
        private readonly IMapper _mapper;
        private readonly ICacheService _cacheService;


        public GetAboutByIdQueryHandler(IRepository<Ecommerce.Domain.Entities.About> repository,
            IMapper mapper,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<Result<AboutDto>> Handle(GetAboutByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo cache key
                string cacheKey = CacheKeys.GetAboutById(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<AboutDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<AboutDto>.Success(cachedResult);
                }

                var about = await _repository.GetByIdAsync(request.Id, cancellationToken);
                if (about == null)
                {
                    return Result<AboutDto>.NotFound("Không tìm thấy thông tin giới thiệu");
                }
                var result = _mapper.Map<AboutDto>(about);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<AboutDto>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<AboutDto>.BadRequest(ex.Message);
            }
        }
    }
}

