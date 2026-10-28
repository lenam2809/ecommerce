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

namespace Ecommerce.Application.Features.Promotions.Commands.CreateFlashSale
{
    public class CreateFlashSaleCommandHandler : IRequestHandler<CreateFlashSaleCommand, Result<FlashSaleDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateFlashSaleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<FlashSaleDto>> Handle(
            CreateFlashSaleCommand request, CancellationToken cancellationToken)
        {
            var code = string.IsNullOrWhiteSpace(request.Code)
                ? $"FS-{DateTime.UtcNow:yyyyMMddHHmmss}"
                : request.Code.Trim().ToUpperInvariant();

            // Kiểm tra trùng mã code
            var exists = await _unitOfWork.BaseRepository<FlashSale>()
                .AnyAsync(fs => fs.Code == code, cancellationToken);

            if (exists)
            {
                return Result<FlashSaleDto>.BadRequest($"Mã chiến dịch Flash Sale '{code}' đã tồn tại.");
            }

            var flashSale = new FlashSale
            {
                Code = code,
                Title = request.Title.Trim(),
                Subtitle = request.Subtitle?.Trim(),
                BannerImageUrl = request.BannerImageUrl?.Trim(),
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsActive = request.IsActive,
                Priority = request.Priority
            };

            if (request.Items != null && request.Items.Any())
            {
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

                    var item = new FlashSaleItem
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

                    flashSale.Items.Add(item);
                }
            }

            await _unitOfWork.BaseRepository<FlashSale>().AddAsync(flashSale, cancellationToken);
            await _unitOfWork.CompleteAsync(cancellationToken);

            // Re-fetch with all inclusions for complete DTO
            var created = await _unitOfWork.BaseRepository<FlashSale>()
                .GetQueryable()
                .AsNoTracking()
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Specifications)
                .Include(fs => fs.Items)
                    .ThenInclude(i => i.ProductVariantSku)
                .FirstOrDefaultAsync(fs => fs.Id == flashSale.Id, cancellationToken);

            var dto = FlashSaleMapping.ToDto(created ?? flashSale);
            return Result<FlashSaleDto>.Success(dto);
        }
    }
}
