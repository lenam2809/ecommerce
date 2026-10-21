using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Helpers;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Promotions.Queries.GetCurrentFlashSale
{
    public class GetCurrentFlashSaleQueryHandler : IRequestHandler<GetCurrentFlashSaleQuery, Result<FlashSaleDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetCurrentFlashSaleQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<FlashSaleDto>> Handle(GetCurrentFlashSaleQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var now = DateTime.UtcNow;

                var baseQuery = _unitOfWork.BaseRepository<FlashSale>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Include(fs => fs.Items)
                        .ThenInclude(i => i.Product)
                            .ThenInclude(p => p.Specifications)
                    .Include(fs => fs.Items)
                        .ThenInclude(i => i.ProductVariantSku)
                    .Where(fs => fs.IsActive);

                // Ưu tiên Flash Sale đang trong khung giờ
                var flashSale = await baseQuery
                    .Where(fs => fs.StartTime <= now && fs.EndTime >= now)
                    .OrderByDescending(fs => fs.Priority)
                    .ThenBy(fs => fs.EndTime)
                    .FirstOrDefaultAsync(cancellationToken);

                // Fallback: nếu chưa có Flash Sale đúng khung giờ hiện tại, lấy Flash Sale active gần nhất (phục vụ demo / staging)
                if (flashSale == null)
                {
                    flashSale = await baseQuery
                        .OrderByDescending(fs => fs.Priority)
                        .ThenByDescending(fs => fs.CreatedAt)
                        .FirstOrDefaultAsync(cancellationToken);
                }

                if (flashSale == null)
                {
                    return Result<FlashSaleDto>.NotFound("Hiện không có chương trình Flash Sale nào đang hoạt động.");
                }

                var remainingSeconds = Math.Max(0, (long)(flashSale.EndTime - now).TotalSeconds);

                var dto = new FlashSaleDto
                {
                    Id = flashSale.Id,
                    Code = flashSale.Code,
                    Title = flashSale.Title,
                    Subtitle = flashSale.Subtitle,
                    BannerImageUrl = flashSale.BannerImageUrl,
                    StartTime = flashSale.StartTime,
                    EndTime = flashSale.EndTime,
                    IsActive = flashSale.IsActive,
                    Priority = flashSale.Priority,
                    TimeRemainingSeconds = remainingSeconds,
                    Items = flashSale.Items
                        .OrderBy(i => i.DisplayOrder)
                        .Select(i =>
                        {
                            var originalPrice = i.OriginalPrice > 0 ? i.OriginalPrice : (i.Product?.Price ?? 0);
                            var discountPercent = originalPrice > 0 && originalPrice > i.FlashSalePrice
                                ? (int)Math.Round((originalPrice - i.FlashSalePrice) / originalPrice * 100)
                                : 0;

                            return new FlashSaleItemDto
                            {
                                Id = i.Id,
                                FlashSaleId = i.FlashSaleId,
                                ProductId = i.ProductId,
                                ProductName = i.Product?.Name ?? string.Empty,
                                ProductSlug = i.Product?.Slug ?? string.Empty,
                                ProductImageUrl = i.Product?.Image,
                                ProductVariantSkuId = i.ProductVariantSkuId,
                                Sku = i.ProductVariantSku?.Sku ?? i.Product?.Sku,
                                FlashSalePrice = i.FlashSalePrice,
                                OriginalPrice = originalPrice,
                                DiscountPercentage = discountPercent,
                                TotalQuota = i.TotalQuota,
                                SoldCount = i.SoldCount,
                                RemainingQuantity = Math.Max(0, i.TotalQuota - i.SoldCount),
                                MaxPerCustomer = i.MaxPerCustomer,
                                IsHeroFeatured = i.IsHeroFeatured,
                                BadgeText = !string.IsNullOrWhiteSpace(i.BadgeText) 
                                    ? i.BadgeText 
                                    : (discountPercent > 0 ? $"-{discountPercent}%" : null),
                                DisplayOrder = i.DisplayOrder,
                                KeySpecs = i.Product?.Specifications != null
                                    ? ProductSpecHelper.ExtractKeySpecs(i.Product.Specifications, i.Product.Name)
                                    : new List<string>()
                            };
                        })
                        .ToList()
                };

                return Result<FlashSaleDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<FlashSaleDto>.BadRequest($"Lỗi khi lấy thông tin Flash Sale: {ex.Message}");
            }
        }
    }
}
