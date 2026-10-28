using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Commands.UpdateShowroomInventory
{
    public class UpdateShowroomInventoryCommandHandler : IRequestHandler<UpdateShowroomInventoryCommand, Result<ShowroomInventoryDto>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateShowroomInventoryCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<ShowroomInventoryDto>> Handle(UpdateShowroomInventoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var showroom = await _unitOfWork.BaseRepository<Showroom>()
                    .GetByIdAsync(request.ShowroomId, cancellationToken);

                if (showroom == null)
                {
                    return Result<ShowroomInventoryDto>.NotFound($"Không tìm thấy Showroom với Id: {request.ShowroomId}");
                }

                var product = await _unitOfWork.Products
                    .GetByIdAsync(request.ProductId, cancellationToken);

                if (product == null)
                {
                    return Result<ShowroomInventoryDto>.NotFound($"Không tìm thấy Product với Id: {request.ProductId}");
                }

                ProductVariantSku? variantSku = null;
                if (request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty)
                {
                    variantSku = await _unitOfWork.BaseRepository<ProductVariantSku>()
                        .GetQueryable()
                        .FirstOrDefaultAsync(v => v.Id == request.ProductVariantSkuId.Value && v.ProductId == request.ProductId, cancellationToken);
                }

                var inventory = await _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable(tracking: true)
                    .FirstOrDefaultAsync(i => i.ShowroomId == request.ShowroomId && i.ProductId == request.ProductId, cancellationToken);

                if (inventory != null)
                {
                    inventory.Quantity = request.Quantity;
                    inventory.ReservedQuantity = request.ReservedQuantity;
                    inventory.IsAvailableFor2hDelivery = request.IsAvailableFor2hDelivery;
                    if (request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty)
                    {
                        inventory.ProductVariantSkuId = request.ProductVariantSkuId;
                    }
                    inventory.UpdatedAt = DateTime.UtcNow;

                    _unitOfWork.BaseRepository<ShowroomInventory>().Update(inventory);
                }
                else
                {
                    inventory = new ShowroomInventory
                    {
                        ShowroomId = request.ShowroomId,
                        ProductId = request.ProductId,
                        ProductVariantSkuId = request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty ? request.ProductVariantSkuId : null,
                        Quantity = request.Quantity,
                        ReservedQuantity = request.ReservedQuantity,
                        IsAvailableFor2hDelivery = request.IsAvailableFor2hDelivery,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    await _unitOfWork.BaseRepository<ShowroomInventory>().AddAsync(inventory, cancellationToken);
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                var dto = new ShowroomInventoryDto
                {
                    ShowroomId = inventory.ShowroomId,
                    ProductId = inventory.ProductId,
                    ProductVariantSkuId = inventory.ProductVariantSkuId,
                    ProductName = product.Name,
                    ProductImage = !string.IsNullOrEmpty(product.Image) ? product.Image : string.Empty,
                    SkuCode = variantSku != null ? variantSku.Sku : product.Sku,
                    VariantInfo = variantSku != null ? variantSku.Sku : "Tiêu chuẩn / Mặc định",
                    Price = variantSku != null ? (variantSku.SalePrice ?? variantSku.Price) : (product.SalePrice ?? product.Price),
                    Quantity = inventory.Quantity,
                    ReservedQuantity = inventory.ReservedQuantity,
                    IsAvailableFor2hDelivery = inventory.IsAvailableFor2hDelivery,
                    UpdatedAt = inventory.UpdatedAt ?? inventory.CreatedAt
                };

                return Result<ShowroomInventoryDto>.Success(dto);
            }
            catch (Exception ex)
            {
                return Result<ShowroomInventoryDto>.BadRequest($"Lỗi khi cập nhật tồn kho cơ sở: {ex.Message}");
            }
        }
    }
}
