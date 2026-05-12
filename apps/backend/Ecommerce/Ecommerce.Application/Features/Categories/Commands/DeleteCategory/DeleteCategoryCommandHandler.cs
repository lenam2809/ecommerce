using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.CategoryBrands.Commands.DeleteCategoryBrandsByCategoryId;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Categories.Commands.DeleteCategory
{
    public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IMediator _mediator;
        private readonly ICacheInvalidationService _cacheInvalidationService;

        public DeleteCategoryCommandHandler(IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IMediator mediator,
            ICacheInvalidationService cacheInvalidationService)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _mediator = mediator;
            _cacheInvalidationService = cacheInvalidationService;
        }

        public async Task<Result<bool>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(request.Id, cancellationToken);
                if (category == null)
                {
                    return Result<bool>.NotFound("Danh mục không tồn tại");
                }

                if (await _unitOfWork.Categories.HasChildrenAsync(request.Id, cancellationToken))
                {
                    return Result<bool>.BadRequest("Không thể xóa danh mục có danh mục con");
                }

                if (await _unitOfWork.Categories.HasProductsAsync(request.Id, cancellationToken))
                {
                    return Result<bool>.BadRequest("Không thể xóa danh mục đang chứa sản phẩm");
                }

                if (!string.IsNullOrEmpty(category.Image))
                {
                    await _fileStorageService.DeleteFileAsync(category.Image);
                }

                // Xóa tất cả liên kết CategoryBrand
                await _mediator.Send(new DeleteCategoryBrandsByCategoryIdCommand
                {
                    CategoryId = request.Id
                }, cancellationToken);

                _unitOfWork.Categories.Delete(category);
                await _unitOfWork.CompleteAsync(cancellationToken);
                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Category deleted successfully for {CategoryId}",
                    "DeleteCategory",
                    properties: new Dictionary<string, object?>
                    {
                        { "CategoryId", request.Id }
                    });





                await _cacheInvalidationService.InvalidateCategoryCache(request.Id);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi xóa danh mục");
                return Result<bool>.BadRequest($"Lỗi khi xóa danh mục: {ex.Message}");
            }
        }
    }
}

