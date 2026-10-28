using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Promotions.Dto;
using Ecommerce.Application.Features.Promotions.Helpers;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Promotions.Commands.UpdateFlashSale
{
    public class UpdateFlashSaleCommandHandler : IRequestHandler<UpdateFlashSaleCommand, Result<FlashSaleDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateFlashSaleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<FlashSaleDto>> Handle(
            UpdateFlashSaleCommand request, CancellationToken cancellationToken)
        {
            var flashSale = await _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable(tracking: true)
                .Include(fs => fs.Items)
                .FirstOrDefaultAsync(fs => fs.Id == request.Id, cancellationToken);

            if (flashSale == null)
            {
                return Result<FlashSaleDto>.NotFound("Chiến dịch Flash Sale không tồn tại.");
            }

            var trimmedCode = !string.IsNullOrWhiteSpace(request.Code)
                ? request.Code.Trim().ToUpperInvariant()
                : flashSale.Code;

            if (trimmedCode != flashSale.Code)
            {
                var duplicateCode = await _unitOfWork.BaseRepository<FlashSale>()
                    .AnyAsync(fs => fs.Code == trimmedCode && fs.Id != request.Id, cancellationToken);

                if (duplicateCode)
                {
                    return Result<FlashSaleDto>.BadRequest($"Mã chiến dịch '{trimmedCode}' đã được sử dụng.");
                }

                flashSale.Code = trimmedCode;
            }

            flashSale.Title = request.Title.Trim();
            flashSale.Subtitle = request.Subtitle?.Trim();
            flashSale.BannerImageUrl = request.BannerImageUrl?.Trim();
            flashSale.StartTime = request.StartTime;
            flashSale.EndTime = request.EndTime;
            flashSale.IsActive = request.IsActive;
            flashSale.Priority = request.Priority;

            // Đồng bộ danh sách items
            if (request.Items != null)
            {
                var incomingItemIds = request.Items
                    .Where(i => i.Id.HasValue && i.Id.Value != Guid.Empty)
                    .Select(i => i.Id!.Value)
                    .ToHashSet();

                // Xóa những item cũ không còn trong request
                var itemsToRemove = flashSale.Items
                    .Where(i => !incomingItemIds.Contains(i.Id))
                    .ToList();

                foreach (var rem in itemsToRemove)
                {
                    flashSale.Items.Remove(rem);
                }

                var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await _unitOfWork.Products
                    .GetQueryable()
                    .Where(p => productIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id, cancellationToken);

                int order = 0;
                foreach (var itemDto in request.Items)
                {
                    products.TryGetValue(itemDto.ProductId, out var product);
                    var originalPrice = itemDto.OriginalPrice > 0
                        ? itemDto.OriginalPrice
                        : (product?.Price ?? 0);

                    FlashSaleItem? existingItem = null;
                    if (itemDto.Id.HasValue && itemDto.Id.Value != Guid.Empty)
                    {
                        existingItem = flashSale.Items.FirstOrDefault(i => i.Id == itemDto.Id.Value);
                    }

                    if (existingItem != null)
                    {
                        existingItem.ProductId = itemDto.ProductId;
                        existingItem.ProductVariantSkuId = itemDto.ProductVariantSkuId;
                        existingItem.FlashSalePrice = itemDto.FlashSalePrice;
                        existingItem.OriginalPrice = originalPrice;
                        existingItem.TotalQuota = itemDto.TotalQuota;
                        existingItem.SoldCount = itemDto.SoldCount;
                        existingItem.MaxPerCustomer = itemDto.MaxPerCustomer > 0 ? itemDto.MaxPerCustomer : 1;
                        existingItem.IsHeroFeatured = itemDto.IsHeroFeatured;
                        existingItem.BadgeText = itemDto.BadgeText?.Trim();
                        existingItem.DisplayOrder = itemDto.DisplayOrder > 0 ? itemDto.DisplayOrder : order++;
                    }
                    else
                    {
                        var newItem = new FlashSaleItem
                        {
                            FlashSaleId = flashSale.Id,
                            ProductId = itemDto.ProductId,
                            ProductVariantSkuId = itemDto.ProductVariantSkuId,
                            FlashSalePrice = itemDto.FlashSalePrice,
                            OriginalPrice = originalPrice,
                            TotalQuota = itemDto.TotalQuota,
                            SoldCount = itemDto.SoldCount,
                            MaxPerCustomer = itemDto.MaxPerCustomer > 0 ? itemDto.MaxPerCustomer : 1,
                            IsHeroFeatured = itemDto.IsHeroFeatured,
                            BadgeText = itemDto.BadgeText?.Trim(),
                            DisplayOrder = itemDto.DisplayOrder > 0 ? itemDto.DisplayOrder : order++
                        };
                        flashSale.Items.Add(newItem);
                    }
                }
            }

            _unitOfWork.BaseRepository<FlashSale>().Update(flashSale);
            await _unitOfWork.CompleteAsync(cancellationToken);

            var updated = await _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable()
                .AsNoTracking()
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Specifications)
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.ProductVariantSku)
                .FirstOrDefaultAsync(fs => fs.Id == flashSale.Id, cancellationToken);

            var dto = FlashSaleMapping.ToDto(updated ?? flashSale);
            return Result<FlashSaleDto>.Success(dto);
        }
    }
}
