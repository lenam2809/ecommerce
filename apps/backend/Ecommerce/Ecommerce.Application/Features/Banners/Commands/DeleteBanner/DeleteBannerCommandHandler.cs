using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Banners.Commands.DeleteBanner
{
    public class DeleteBannerCommandHandler : IRequestHandler<DeleteBannerCommand, Result<bool>>
    {
        private readonly IBannerRepository _repository;
        private readonly ICacheService _cacheService;

        public DeleteBannerCommandHandler(IBannerRepository repository,
            ICacheService cacheService)
        {
            _repository = repository;
            _cacheService = cacheService;
        }

        public async Task<Result<bool>> Handle(DeleteBannerCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var banner = await _repository.GetByIdAsync(request.Id, cancellationToken);

                if (banner == null)
                {
                    return Result<bool>.NotFound("Không tìm thấy banner");
                }
                _repository.Delete(banner);
                await _repository.SaveChangesAsync(cancellationToken);

                // Xóa cache liên quan
                await _cacheService.RemoveAsync(CacheKeys.GetBanners()); // static key


                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                return Result<bool>.BadRequest(ex.Message);
            }

        }
    }
}

