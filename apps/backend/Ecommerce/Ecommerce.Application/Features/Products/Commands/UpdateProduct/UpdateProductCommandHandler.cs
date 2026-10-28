using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Queries.GetProductById;
using Ecommerce.Application.Policies;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Commands.UpdateProduct
{
    [Authorize(Policy = AuthorizationPolicyNames.Staff.EditProduct)]
    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<Unit>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IFileStorageService _fileStorageService;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IMediator _mediator;

        public UpdateProductCommandHandler(IUnitOfWork unitOfWork,
            IFileStorageService fileStorageService,
            IEnhancedLogger logger,
            IMapper mapper,
            ICacheInvalidationService cacheInvalidationService,
            IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _fileStorageService = fileStorageService;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidationService = cacheInvalidationService;
            _mediator = mediator;
        }

        public async Task<Result<Unit>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Tìm sản phẩm hiện tại
                var existingProduct = await _unitOfWork.Products.GetByIdWithIncludeAsync(
                    request.Id,
                    true,
                    p => p.Images,
                    p => p.Specifications,
                    p => p.Variants
                );

                if (existingProduct == null)
                {
                    return Result<Unit>.NotFound($"Không tìm thấy sản phẩm với ID: {request.Id}");
                }

                // Xử lý upload ảnh chính mới nếu có
                string mainImageUrl = existingProduct.Image;
                if (request.MainImage != null)
                {
                    mainImageUrl = await _fileStorageService.SaveFileAsync(request.MainImage, "products", $"{SlugHelper.GenerateSlug(request.Name)}-main");
                }

                // Cập nhật thông tin cơ bản
                existingProduct.UpdateInfo(
                    request.Name,
                    SlugHelper.GenerateSlug(request.Name),
                    request.Description,
                    mainImageUrl,
                    request.CategoryId,
                    request.BrandId,
                    request.IsActive
                );

                existingProduct.UpdatePrice(request.Price, request.SalePrice);
                existingProduct.UpdateStock(request.StockQuantity);

                // Replace semantics for additional images:
                bool hasAdditionalImagesPayload =
                    (request.AdditionalImages != null && request.AdditionalImages.Count > 0) ||
                    (request.AdditionalImageUrls != null && request.AdditionalImageUrls.Count > 0);

                bool wantsClearAllAdditionalImages =
                    !hasAdditionalImagesPayload &&
                    (request.AdditionalImages == null || request.AdditionalImages.Count == 0) &&
                    (request.AdditionalImageUrls == null || request.AdditionalImageUrls.Count == 0) &&
                    (request.ImageIdsToDelete == null || request.ImageIdsToDelete.Count == 0);

                if (hasAdditionalImagesPayload || wantsClearAllAdditionalImages)
                {
                    existingProduct.ClearImages();
                }
                else
                {
                    if (request.ImageIdsToDelete != null && request.ImageIdsToDelete.Count != 0)
                    {
                        foreach (var imageId in request.ImageIdsToDelete)
                        {
                            existingProduct.RemoveImage(imageId);
                        }
                    }
                }

                // Xử lý thêm các hình ảnh phụ mới từ File
                if (request.AdditionalImages != null && request.AdditionalImages.Count > 0)
                {
                    foreach (var file in request.AdditionalImages)
                    {
                        var imageUrl = await _fileStorageService.SaveFileAsync(file, "products/gallery", $"{SlugHelper.GenerateSlug(request.Name)}-gallery");
                        existingProduct.AddImage(imageUrl);
                    }
                }

                // Xử lý thêm các hình ảnh phụ từ URL (đã upload trước đó)
                if (request.AdditionalImageUrls != null && request.AdditionalImageUrls.Count > 0)
                {
                    foreach (var imageUrl in request.AdditionalImageUrls)
                    {
                        existingProduct.AddImage(imageUrl);
                    }
                }

                // Xử lý xóa thông số kỹ thuật
                if (request.SpecificationIdsToDelete != null && request.SpecificationIdsToDelete.Count != 0)
                {
                    foreach (var specId in request.SpecificationIdsToDelete)
                    {
                        var specToDelete = existingProduct.Specifications.FirstOrDefault(s => s.Id == specId);
                        if (specToDelete != null)
                        {
                            existingProduct.Specifications.Remove(specToDelete);
                        }
                    }
                }

                // Xử lý cập nhật và thêm mới thông số kỹ thuật (truyền đủ 7 tham số theo SSoT 2026)
                if (request.Specifications != null)
                {
                    foreach (var spec in request.Specifications)
                    {
                        if (spec.Id.HasValue && spec.Id.Value != Guid.Empty)
                        {
                            // Cập nhật thông số hiện có
                            var existingSpec = existingProduct.Specifications.FirstOrDefault(s => s.Id == spec.Id.Value);
                            if (existingSpec != null)
                            {
                                existingSpec.Name = spec.Name;
                                existingSpec.Value = spec.Value;
                                existingSpec.GroupName = spec.GroupName;
                                existingSpec.IsKeySpec = spec.IsKeySpec;
                                existingSpec.DisplayOrder = spec.DisplayOrder;
                                existingSpec.FilterKey = spec.FilterKey;
                                existingSpec.IsHighlight = spec.IsHighlight || spec.IsKeySpec;
                            }
                            else
                            {
                                existingProduct.AddSpecification(
                                    spec.Name,
                                    spec.Value,
                                    spec.GroupName,
                                    spec.IsKeySpec,
                                    spec.DisplayOrder,
                                    spec.FilterKey,
                                    spec.IsHighlight
                                );
                            }
                        }
                        else
                        {
                            // Thêm thông số mới
                            existingProduct.AddSpecification(
                                spec.Name,
                                spec.Value,
                                spec.GroupName,
                                spec.IsKeySpec,
                                spec.DisplayOrder,
                                spec.FilterKey,
                                spec.IsHighlight
                            );
                        }
                    }
                }

                // Cập nhật bảo hành & xuất xứ SSoT 2026
                if (request.WarrantyMonths.HasValue && request.WarrantyMonths.Value > 0)
                {
                    existingProduct.WarrantyMonths = request.WarrantyMonths.Value;
                }

                if (request.OriginBadge != null)
                {
                    existingProduct.OriginBadge = request.OriginBadge;
                }

                // Gắn / gỡ các gói dịch vụ mua kèm (ProductAddOns)
                if (request.AddOnIds != null && request.AddOnIds.Count > 0)
                {
                    var addOnRepo = _unitOfWork.BaseRepository<ProductAddOn>();
                    if (addOnRepo != null)
                    {
                        var currentAddOns = await addOnRepo.GetQueryable(tracking: true)
                            .Where(a => a.ProductId == existingProduct.Id || request.AddOnIds.Contains(a.Id))
                            .ToListAsync(cancellationToken);

                        foreach (var addOn in currentAddOns)
                        {
                            if (request.AddOnIds.Contains(addOn.Id))
                            {
                                addOn.ProductId = existingProduct.Id;
                            }
                            else if (addOn.ProductId == existingProduct.Id)
                            {
                                addOn.ProductId = null;
                            }
                        }
                    }
                }

                // Xử lý variants (colors, sizes)
                if ((request.Colors != null && request.Colors.Count != 0) ||
                    (request.Sizes != null && request.Sizes.Count != 0))
                {
                    if (existingProduct.Variants != null)
                    {
                        if (request.Colors != null) 
                        {
                            await _unitOfWork.Products.ClearColorAsync(existingProduct.Id, cancellationToken);
                        }
                        if (request.Sizes != null)
                        {
                            await _unitOfWork.Products.ClearSizeAsync(existingProduct.Id, cancellationToken);
                        }
                    }

                    existingProduct.SetVariants(
                        request.Colors ?? existingProduct.Variants?.Colors?.Select(c => c.Color).ToList() ?? new List<string>(),
                        request.Sizes ?? existingProduct.Variants?.Sizes?.Select(s => s.Size).ToList() ?? new List<string>()
                    );
                }

                // Cập nhật sản phẩm vào database
                _unitOfWork.Products.Update(existingProduct);
                await _unitOfWork.CompleteAsync(cancellationToken);

                await _logger.LogAsync(
                    ELogLevel.Information,
                    "Product updated successfully for {ProductId}",
                    "UpdateProduct",
                    properties: new Dictionary<string, object?>
                    {
                        { "ProductId", existingProduct.Id }
                    });
                
                // Xóa cache liên quan
                await _cacheInvalidationService.InvalidateProductCache(existingProduct.Id);

                // Publish event để sync Elasticsearch
                await _mediator.Publish(new ProductUpdatedEvent(existingProduct.Id), cancellationToken);
                
                return Result<Unit>.Success(Unit.Value);
            }
            catch (ArgumentException aex)
            {
                 return Result<Unit>.BadRequest(aex.Message);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Đã xảy ra lỗi khi cập nhật sản phẩm");
                return Result<Unit>.BadRequest($"Lỗi khi cập nhật sản phẩm: {ex.Message}");
            }
        }
    }
}
