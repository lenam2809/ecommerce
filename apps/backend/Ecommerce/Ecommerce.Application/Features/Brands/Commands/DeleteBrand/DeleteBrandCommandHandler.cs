using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByBrandId;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Brands.Commands.DeleteBrand
{
    public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IFileStorageService _fileStorageService;
        private readonly IMediator _mediator;
        private readonly ICacheInvalidationService _cacheInvalidationService;


        public DeleteBrandCommandHandler(
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IFileStorageService fileStorageService,
            IMediator mediator,
            ICacheInvalidationService cacheInvalidationService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _fileStorageService = fileStorageService;
            _mediator = mediator;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<bool>> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var brand = await _unitOfWork.Brands.GetByIdAsync(request.Id, cancellationToken);

                if (brand == null)
                {
                    return Result<bool>.NotFound("Thương hiệu không tồn tại");
                }

                if (await _unitOfWork.Brands.HasProductsAsync(request.Id, cancellationToken))
                {
                    return Result<bool>.BadRequest("Không thể xóa danh mục đang chứa sản phẩm");
                }

                // Xóa tất cả liên kết CategoryBrand
                await _mediator.Send(new DeleteCategoryBrandsByBrandIdCommand
                {
                    BrandId = request.Id
                }, cancellationToken);

                // Xóa logo nếu có
                if (!string.IsNullOrEmpty(brand.LogoUrl))
                {
                    await _fileStorageService.DeleteFileAsync(brand.LogoUrl);
                }

                _unitOfWork.Brands.Delete(brand);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(ELogLevel.Information,
                    "Brand deleted successfully for {BrandId}",
                    "DeleteBrand",
                    properties: new Dictionary<string, object?>
                    {
                        { "BrandId", request.Id }
                    });

                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateBrandCache(request.Id);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi xóa thương hiệu");
                return Result<bool>.BadRequest($"Lỗi khi xóa thương hiệu: {ex.Message}");
            }
        }
    }
}

