using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Queries.GetBannerById
{
    public class GetBannerByIdQueryHandler : IRequestHandler<GetBannerByIdQuery, Result<BannerDto>>
    {
        private readonly IBannerRepository _repository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;

        public GetBannerByIdQueryHandler(IBannerRepository repository,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _repository = repository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<BannerDto>> Handle(GetBannerByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                string cacheKey = CacheKeys.GetBannerById(request);

                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<BannerDto>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<BannerDto>.Success(cachedResult);
                }


                var banner = await _repository.GetByIdAsync(request.Id, cancellationToken);

                if (banner == null)
                {
                    return Result<BannerDto>.NotFound($"Không tìm thấy banner có id {request.Id}");
                }

                var bannerDto = _mapper.Map<BannerDto>(banner);

                // Cập nhật URL cho hình ảnh
                bannerDto.ImageUrl = await _fileStorageService.GetFileUrlAsync(bannerDto.ImageUrl);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, bannerDto, ECachePolicy.Long.ToTimeSpan());

                return Result<BannerDto>.Success(bannerDto);
            }
            catch (Exception ex)
            {
                return Result<BannerDto>.BadRequest(ex.Message);
            }

        }
    }
}

