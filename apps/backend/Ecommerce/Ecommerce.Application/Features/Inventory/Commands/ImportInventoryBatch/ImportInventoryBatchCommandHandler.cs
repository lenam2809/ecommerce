using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;

namespace Ecommerce.Application.Features.Inventory.Commands.ImportInventoryBatch
{
    public class ImportInventoryBatchCommandHandler
        : IRequestHandler<ImportInventoryBatchCommand, Result<int>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;

        public ImportInventoryBatchCommandHandler(IUnitOfWork unitOfWork, IEnhancedLogger logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<int>> Handle(
            ImportInventoryBatchCommand request, CancellationToken cancellationToken)
        {
            var sku = await _unitOfWork.ProductVariantSkus
                .GetByIdAsync(request.ProductVariantSkuId, cancellationToken);
            if (sku is null)
            {
                return Result<int>.NotFound("SKU không tồn tại.");
            }

            if (!request.Items.Any())
            {
                return Result<int>.BadRequest("Danh sách IMEI/Serial không được rỗng.");
            }

            var importedCount = 0;
            var errors = new List<string>();

            foreach (var item in request.Items)
            {
                var existing = await _unitOfWork.InventoryItems
                    .GetBySerialNumberAsync(item.SerialNumber, cancellationToken);
                if (existing is not null)
                {
                    errors.Add($"Serial '{item.SerialNumber}' đã tồn tại.");
                    continue;
                }

                var inventoryItem = InventoryItem.Create(
                    request.ProductVariantSkuId,
                    item.SerialNumber,
                    item.BatchCode);

                await _unitOfWork.InventoryItems.AddAsync(inventoryItem, cancellationToken);
                importedCount++;
            }

            sku.UpdateStock(sku.StockQuantity + importedCount);

            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(
                ELogLevel.Information,
                "Imported inventory batch for {Sku} with {ImportedCount} of {RequestedCount} items",
                "ImportInventory",
                properties: new Dictionary<string, object?>
                {
                    { "Sku", sku.Sku },
                    { "ImportedCount", importedCount },
                    { "RequestedCount", request.Items.Count },
                    { "ErrorCount", errors.Count },
                    { "Errors", errors.Any() ? string.Join("; ", errors) : string.Empty }
                });

            return Result<int>.Success(importedCount);
        }
    }
}
