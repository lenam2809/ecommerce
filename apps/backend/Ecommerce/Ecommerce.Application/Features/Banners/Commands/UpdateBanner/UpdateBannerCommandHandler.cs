using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Banners.Queries.GetBannerById;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Commands.UpdateBanner
{
    public class UpdateBannerCommandHandler : IRequestHandler<UpdateBannerCommand, Result<bool>>
    {
        private readonly IBannerRepository _repository;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheInvalidationService _cacheInvalidationService;


        public UpdateBannerCommandHandler(IBannerRepository repository,
            IFileStorageService fileStorageService,
            ICacheInvalidationService cacheInvalidationService)
        {
            _repository = repository;
            _fileStorageService = fileStorageService;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<bool>> Handle(UpdateBannerCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var banner = await _repository.GetByIdAsync(request.Id, cancellationToken);
                if (banner == null) return Result<bool>.NotFound("Không tìm thấy banner.");

                banner.Title = request.Title;
                banner.Description = request.Description;
                banner.ButtonText = request.ButtonText;
                banner.ButtonLink = request.ButtonLink;
                banner.UpdatedAt = DateTime.Now;
                banner.IsActive = request.IsActive;

                // Xử lý hình ảnh chính nếu có cập nhật
                if (request.Image != null)
                {
                    // Xóa hình ảnh cũ nếu có
                    if (!string.IsNullOrEmpty(banner.ImageUrl))
                    {
                        await _fileStorageService.DeleteFileAsync(banner.ImageUrl);
                    }

                    // Lưu hình ảnh mới
                    string mainImagePath = await _fileStorageService.SaveFileAsync(
                        request.Image,
                        "banners");

                    banner.ImageUrl = mainImagePath;
                }

                _repository.Update(banner);
                await _repository.SaveChangesAsync(cancellationToken);

                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateBannerCache(banner.Id);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }
        }
    }
}

