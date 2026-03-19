using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Commands.CreateBanner
{
    public class CreateBannerCommandHandler : IRequestHandler<CreateBannerCommand, Result<Guid>>
    {
        private readonly IBannerRepository _repository;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;


        public CreateBannerCommandHandler(IBannerRepository repository,
            IFileStorageService fileStorageService,
            ICacheService cacheService)
        {
            _repository = repository;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
        }

        public async Task<Result<Guid>> Handle(CreateBannerCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var banner = new Banner
                {
                    Title = request.Title,
                    Description = request.Description,
                    ButtonText = request.ButtonText,
                    ButtonLink = request.ButtonLink,
                    IsActive = request.IsActive
                };

                // Xử lý hình ảnh chính
                if (request.Image != null)
                {
                    string mainImagePath = await _fileStorageService.SaveFileAsync(
                        request.Image,
                        "banners");

                    banner.ImageUrl = mainImagePath;
                }

                await _repository.AddAsync(banner, cancellationToken);
                await _repository.SaveChangesAsync(cancellationToken);

                // Xóa cache liên quan
                await _cacheService.RemoveAsync(CacheKeys.GetBanners()); // static key

                return Result<Guid>.Success(banner.Id);
            }
            catch (Exception ex)
            {
                return Result<Guid>.BadRequest(ex.Message);
            }
        }

    }
}

