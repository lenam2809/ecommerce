using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Queries.GetBanners
{
    public class GetBannersQueryHandler : IRequestHandler<GetBannersQuery, Result<List<BannerDto>>>
    {
        private readonly IBannerRepository _repository;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;


        public GetBannersQueryHandler(IBannerRepository repository,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _repository = repository;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<List<BannerDto>>> Handle(GetBannersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var banners = await _repository.GetAllAsync(cancellationToken);
                var bannerDtos = _mapper.Map<List<BannerDto>>(banners);
                // Cập nhật URL cho hình ảnh
                foreach (var bannerDto in bannerDtos)
                {
                    bannerDto.ImageUrl = await _fileStorageService.GetFileUrlAsync(bannerDto.ImageUrl);
                }

                return Result<List<BannerDto>>.Success(bannerDtos);
            }
            catch (Exception ex)
            {
                return Result<List<BannerDto>>.BadRequest(ex.Message);
            }


        }
    }
}

