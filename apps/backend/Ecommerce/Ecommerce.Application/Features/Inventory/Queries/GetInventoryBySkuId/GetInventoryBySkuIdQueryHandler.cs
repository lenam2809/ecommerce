using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Inventory.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;

namespace Ecommerce.Application.Features.Inventory.Queries.GetInventoryBySkuId
{
    public class GetInventoryBySkuIdQueryHandler
        : IRequestHandler<GetInventoryBySkuIdQuery, Result<List<InventoryItemDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetInventoryBySkuIdQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<InventoryItemDto>>> Handle(
            GetInventoryBySkuIdQuery request, CancellationToken cancellationToken)
        {
            var sku = await _unitOfWork.ProductVariantSkus
                .GetByIdAsync(request.ProductVariantSkuId, cancellationToken);
            if (sku is null)
                return Result<List<InventoryItemDto>>.NotFound("SKU không tồn tại.");

            var items = await _unitOfWork.InventoryItems
                .GetBySkuIdAsync(request.ProductVariantSkuId, cancellationToken);

            var dtos = items.Select(i => new InventoryItemDto
            {
                Id = i.Id,
                ProductVariantSkuId = i.ProductVariantSkuId,
                SkuCode = sku.Sku,
                SerialNumber = i.SerialNumber,
                Status = i.Status,
                StatusDisplay = i.Status.ToString(),
                OrderItemId = i.OrderItemId,
                ImportedAt = i.ImportedAt,
                BatchCode = i.BatchCode,
                Notes = i.Notes
            }).ToList();

            return Result<List<InventoryItemDto>>.Success(dtos);
        }
    }
}
