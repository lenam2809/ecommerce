using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using Ecommerce.Domain.Enums;
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
            // Validate SKU exists
            var sku = await _unitOfWork.ProductVariantSkus
                .GetByIdAsync(request.ProductVariantSkuId, cancellationToken);
            if (sku is null)
                return Result<int>.NotFound("SKU không tồn tại.");

            if (!request.Items.Any())
                return Result<int>.BadRequest("Danh sách IMEI/Serial không được rỗng.");

            var importedCount = 0;
            var errors = new List<string>();

            foreach (var item in request.Items)
            {
                // Check duplicate serial number
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

            // Update SKU stock quantity
            sku.UpdateStock(sku.StockQuantity + importedCount);

            await _unitOfWork.CompleteAsync(cancellationToken);

            await _logger.LogAsync(ELogLevel.Information,
                $"Đã import {importedCount}/{request.Items.Count} IMEI/Serial cho SKU {sku.Sku}. " +
                (errors.Any() ? $"Lỗi: {string.Join("; ", errors)}" : ""),
                "Import Inventory");

            if (errors.Any())
                return Result<int>.Success(importedCount);

            return Result<int>.Success(importedCount);
        }
    }
}
