using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.CreateProduct
{
    [Authorize(Policy = EPermissions.CreateProduct)]
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;
        private readonly ICacheInvalidationService _cacheInvalidationService;
        private readonly IMediator _mediator;
        private readonly IFileStorageService _fileStorageService;


        public CreateProductCommandHandler(IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper,
            ICacheInvalidationService cacheInvalidationService,
            IMediator mediator,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
            _cacheInvalidationService = cacheInvalidationService;
            _mediator = mediator;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            // Upload Main Image
            string mainImageUrl = await _fileStorageService.SaveFileAsync(request.MainImage, "products");

            // Sử dụng Factory Method của Domain Entity
            var product = Product.Create(
                request.Code,
                request.Name,
                SlugHelper.GenerateSlug(request.Name),
                request.Sku,
                request.Price,
                request.SalePrice,
                mainImageUrl,
                request.Description,
                request.StockQuantity,
                request.CategoryId,
                request.BrandId
            );

            // Xử lý các ảnh phụ từ File
            if (request.AdditionalImages != null && request.AdditionalImages.Count > 0)
            {
                foreach (var file in request.AdditionalImages)
                {
                    var imageUrl = await _fileStorageService.SaveFileAsync(file, "products/gallery");
                    product.AddImage(imageUrl);
                }
            }

            // Xử lý các ảnh phụ từ URL
            if (request.AdditionalImageUrls != null && request.AdditionalImageUrls.Count > 0)
            {
                foreach (var imageUrl in request.AdditionalImageUrls)
                {
                    product.AddImage(imageUrl);
                }
            }

            // Xử lý thông số kỹ thuật
            if (request.Specifications != null)
            {
                foreach (var spec in request.Specifications)
                {
                    product.AddSpecification(spec.Name, spec.Value);
                }
            }

            // Xử lý variants (colors, sizes)
            if ((request.Colors != null && request.Colors.Any()) ||
                (request.Sizes != null && request.Sizes.Any()))
            {
                product.SetVariants(
                    request.Colors ?? new List<string>(), 
                    request.Sizes ?? new List<string>()
                );
            }

            // Lưu sản phẩm vào database
            var result = await _unitOfWork.Products.AddAsync(product, cancellationToken);

            await _unitOfWork.CompleteAsync(cancellationToken);
            await _logger.LogAsync(
                ELogLevel.Information,
                "Product created successfully for {ProductId}",
                "CreateProduct",
                properties: new Dictionary<string, object?>
                {
                    { "ProductId", result.Id }
                });

            // Xóa cache liên quan
            await _cacheInvalidationService.InvalidateProductCache(result.Id);

            // Publish event để sync Elasticsearch
            await _mediator.Publish(new ProductCreatedEvent(result.Id), cancellationToken);

            return Result<Guid>.Success(result.Id);
        }
    }
}

