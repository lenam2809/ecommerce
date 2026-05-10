using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Products.EventHandlers
{
    /// <summary>
    /// Khi Product được cập nhật → Update document trên Elasticsearch.
    /// </summary>
    public class ProductUpdatedEventHandler : INotificationHandler<ProductUpdatedEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductSearchService _productSearchService;
        private readonly ILogger<ProductUpdatedEventHandler> _logger;

        public ProductUpdatedEventHandler(
            IUnitOfWork unitOfWork,
            IProductSearchService productSearchService,
            ILogger<ProductUpdatedEventHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _productSearchService = productSearchService;
            _logger = logger;
        }

        public async Task Handle(ProductUpdatedEvent notification, CancellationToken cancellationToken)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdWithIncludeAsync(
                    notification.ProductId,
                    false,
                    p => p.Category,
                    p => p.Brand,
                    p => p.Specifications,
                    p => p.Attributes);

                if (product == null)
                {
                    _logger.LogWarning("ProductUpdatedEvent: Không tìm thấy Product {ProductId}", notification.ProductId);
                    return;
                }

                var dto = new ProductSearchResultDto
                {
                    Id = product.Id,
                    Code = product.Code,
                    Name = product.Name,
                    Sku = product.Sku,
                    Slug = product.Slug,
                    Price = product.Price,
                    SalePrice = product.SalePrice,
                    Image = product.Image,
                    MainImage = product.Image,
                    Description = product.Description,
                    StockQuantity = product.StockQuantity,
                    Rating = product.Rating,
                    ReviewCount = product.ReviewCount,
                    IsActive = product.IsActive,
                    CategoryId = product.CategoryId,
                    CategoryName = product.Category?.Name ?? string.Empty,
                    CategorySlug = product.Category?.Slug ?? string.Empty,
                    BrandId = product.BrandId,
                    BrandName = product.Brand?.Name ?? string.Empty,
                    BrandSlug = product.Brand?.Slug ?? string.Empty,
                    CreatedAt = product.CreatedAt,
                    Tags = product.Specifications
                        .SelectMany(s => new[] { s.Name, s.Value })
                        .Concat(product.Attributes.Select(a => a.Name))
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList()
                };

                await _productSearchService.UpdateProductAsync(dto, cancellationToken);
                _logger.LogInformation("Đã sync Product {ProductId} vào Elasticsearch (Updated)", notification.ProductId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi sync Product {ProductId} vào Elasticsearch (Updated)", notification.ProductId);
            }
        }
    }
}
