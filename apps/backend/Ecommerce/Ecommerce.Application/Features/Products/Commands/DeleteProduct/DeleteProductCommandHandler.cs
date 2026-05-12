using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.DeleteProduct
{
    //[Authorize(Policy = EPermissions.DeleteProduct)]
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IMediator _mediator;

        public DeleteProductCommandHandler(IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            ICacheInvalidationService cacheInvalidationService,
            IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _cacheInvalidationService = cacheInvalidationService;
            _mediator = mediator;
        }

        public async Task<Result<Unit>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Tìm sản phẩm với tất cả các thông tin liên quan
                var product = await _unitOfWork.Products.GetByIdWithIncludeAsync(
                    request.Id,
                    true,
                    p => p.Images,
                    p => p.Specifications,
                    p => p.Variants
                );

                if (product == null)
                {
                    return Result<Unit>.NotFound($"Không tìm thấy sản phẩm với ID: {request.Id}");
                }

                // Kiểm tra sản phẩm có nằm trong wishlist nào không
                var isInWishlist = await _unitOfWork.Wishlists
                    .IsProductInAnyWishlistAsync(request.Id, cancellationToken);

                if (isInWishlist)
                {
                    return Result<Unit>.BadRequest("Không thể xóa sản phẩm vì đang nằm trong danh sách yêu thích của người dùng.");
                }

                // Xóa hình ảnh chính
                if (!string.IsNullOrEmpty(product.Image))
                {
                    await _fileStorageService.DeleteFileAsync(product.Image);
                }

                // Xóa các hình ảnh phụ
                if (product.Images != null && product.Images.Any())
                {
                    foreach (var image in product.Images)
                    {
                        await _fileStorageService.DeleteFileAsync(image.Url);
                    }
                }

                // Xóa sản phẩm và tất cả các entity liên quan
                _unitOfWork.Products.Delete(product);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Product deleted successfully for {ProductId}",
                    "DeleteProduct",
                    properties: new Dictionary<string, object?>
                    {
                        { "ProductId", request.Id }
                    });

                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateProductCache(request.Id);

                // Publish event để sync Elasticsearch
                await _mediator.Publish(new ProductDeletedEvent(request.Id), cancellationToken);

                return Result<Unit>.Success(Unit.Value);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi xóa sản phẩm");
                return Result<Unit>.BadRequest($"Lỗi khi xóa sản phẩm: {ex.Message}");
            }
        }
    }
}

