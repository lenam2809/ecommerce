using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Events;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Application.Features.Products.EventHandlers
{
    /// <summary>
    /// Khi Product mới được tạo → Index document vào Elasticsearch.
    /// </summary>
    public class ProductCreatedEventHandler : INotificationHandler<ProductCreatedEvent>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductSearchService _productSearchService;
        private readonly ILogger<ProductCreatedEventHandler> _logger;

        public ProductCreatedEventHandler(
            IUnitOfWork unitOfWork,
            IProductSearchService productSearchService,
            ILogger<ProductCreatedEventHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _productSearchService = productSearchService;
            _logger = logger;
        }

        public async Task Handle(ProductCreatedEvent notification, CancellationToken cancellationToken)
        {
            try
            {
                // Load product với Category và Brand navigation properties
                var product = await _unitOfWork.Products.GetByIdWithIncludeAsync(
                    notification.ProductId,
                    false,
                    p => p.Category,
                    p => p.Brand,
                    p => p.Specifications,
                    p => p.Attributes);

                if (product == null)
                {
                    _logger.LogWarning("ProductCreatedEvent: Không tìm thấy Product {ProductId}", notification.ProductId);
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

                await _productSearchService.IndexProductAsync(dto, cancellationToken);
                _logger.LogInformation("Đã sync Product {ProductId} vào Elasticsearch (Created)", notification.ProductId);
            }
            catch (Exception ex)
            {
                // Không throw — Elasticsearch sync failure không block luồng chính
                _logger.LogError(ex, "Lỗi khi sync Product {ProductId} vào Elasticsearch (Created)", notification.ProductId);
            }
        }
    }
}
