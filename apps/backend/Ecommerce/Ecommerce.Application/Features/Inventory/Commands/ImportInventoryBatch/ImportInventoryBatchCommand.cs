using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Inventory.Dto;
using MediatR;

namespace Ecommerce.Application.Features.Inventory.Commands.ImportInventoryBatch
{
    /// <summary>
    /// Nhập lô IMEI/Serial Number vào kho cho một SKU biến thể
    /// </summary>
    public class ImportInventoryBatchCommand : IRequest<Result<int>>
    {
        public Guid ProductVariantSkuId { get; set; }
        public List<InventoryImportItemDto> Items { get; set; } = [];
    }
}
