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
        private readonly ICacheService _cacheService;
        private readonly IMediator _mediator;


        public CreateProductCommandHandler(IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper,
            ICacheService cacheService,
            IMediator mediator)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
            _cacheService = cacheService;
            _mediator = mediator;
        }

        public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            // Sử dụng Factory Method của Domain Entity
            // Các lỗi ArgumentException từ Domain sẽ được GlobalExceptionHandlingMiddleware bắt và trả về 400
            var product = Product.Create(
                request.Code,
                request.Name,
                SlugHelper.GenerateSlug(request.Name),
                request.Sku,
                request.Price,
                request.SalePrice,
                request.MainImage, // Giả sử MainImage là required hoặc xử lý null ở Controller/Validator
                request.Description,
                request.StockQuantity,
                request.CategoryId,
                request.BrandId
            );

            // Xử lý các ảnh phụ
            if (request.AdditionalImages != null)
            {
                foreach (var imageUrl in request.AdditionalImages)
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
            await _logger.LogAsync(ELogLevel.Information, $"Sản phẩm đã được tạo thành công với ID: {result.Id}", "Thêm mới sản phẩm");

            // Xóa cache liên quan
            await _cacheService.RemoveAsync(CacheKeys.GetProducts());
            await _cacheService.RemoveAsync(CacheKeys.GetOptionProducts());

            // Publish event để sync Elasticsearch
            await _mediator.Publish(new ProductCreatedEvent(result.Id), cancellationToken);

            return Result<Guid>.Success(result.Id);
        }
    }
}

