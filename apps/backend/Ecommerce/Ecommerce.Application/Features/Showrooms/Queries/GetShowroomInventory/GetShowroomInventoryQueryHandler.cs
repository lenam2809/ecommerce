using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Queries.GetShowroomInventory
{
    public class GetShowroomInventoryQueryHandler : IRequestHandler<GetShowroomInventoryQuery, Result<List<ShowroomInventoryDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetShowroomInventoryQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ShowroomInventoryDto>>> Handle(GetShowroomInventoryQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var showroom = await _unitOfWork.BaseRepository<Showroom>()
                    .GetByIdAsync(request.ShowroomId, cancellationToken);

                if (showroom == null)
                {
                    return Result<List<ShowroomInventoryDto>>.NotFound($"Không tìm thấy Showroom với Id {request.ShowroomId}");
                }

                // 1. Lấy toàn bộ tồn kho đã có tại showroom này
                var existingInventories = await _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(i => i.ShowroomId == request.ShowroomId)
                    .Include(i => i.Product)
                    .Include(i => i.ProductVariantSku)
                    .ToListAsync(cancellationToken);

                var inventoryMap = existingInventories.ToDictionary(i => i.ProductId);

                // 2. Lấy danh sách sản phẩm đang hoạt động để hiển thị danh mục O2O đầy đủ
                var productsQuery = _unitOfWork.Products
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(p => p.IsActive);

                if (!string.IsNullOrWhiteSpace(request.Search))
                {
                    var term = request.Search.Trim().ToLower();
                    productsQuery = productsQuery.Where(p =>
                        p.Name.ToLower().Contains(term) ||
                        p.Sku.ToLower().Contains(term) ||
                        p.Code.ToLower().Contains(term));
                }

                var products = await productsQuery
                    .OrderBy(p => p.Name)
                    .Take(100)
                    .ToListAsync(cancellationToken);

                var resultList = new List<ShowroomInventoryDto>();
                var processedProductIds = new HashSet<Guid>();

                // Ưu tiên các sản phẩm đã có bản ghi tồn kho
                foreach (var inv in existingInventories)
                {
                    if (inv.Product == null) continue;

                    if (!string.IsNullOrWhiteSpace(request.Search))
                    {
                        var term = request.Search.Trim().ToLower();
                        var matches = inv.Product.Name.ToLower().Contains(term) ||
                                      inv.Product.Sku.ToLower().Contains(term) ||
                                      (inv.ProductVariantSku != null && inv.ProductVariantSku.Sku.ToLower().Contains(term));
                        if (!matches) continue;
                    }

                    resultList.Add(new ShowroomInventoryDto
                    {
                        ShowroomId = inv.ShowroomId,
                        ProductId = inv.ProductId,
                        ProductVariantSkuId = inv.ProductVariantSkuId,
                        ProductName = inv.Product.Name,
                        ProductImage = !string.IsNullOrEmpty(inv.Product.Image) ? inv.Product.Image : string.Empty,
                        SkuCode = inv.ProductVariantSku != null ? inv.ProductVariantSku.Sku : inv.Product.Sku,
                        VariantInfo = inv.ProductVariantSku != null ? inv.ProductVariantSku.Sku : "Tiêu chuẩn / Mặc định",
                        Price = inv.ProductVariantSku != null
                            ? (inv.ProductVariantSku.SalePrice ?? inv.ProductVariantSku.Price)
                            : (inv.Product.SalePrice ?? inv.Product.Price),
                        Quantity = inv.Quantity,
                        ReservedQuantity = inv.ReservedQuantity,
                        IsAvailableFor2hDelivery = inv.IsAvailableFor2hDelivery,
                        UpdatedAt = inv.UpdatedAt ?? inv.CreatedAt
                    });

                    processedProductIds.Add(inv.ProductId);
                }

                // Bổ sung các sản phẩm chưa có bản ghi tồn kho tại cơ sở này (mặc định tồn 0)
                foreach (var prod in products)
                {
                    if (processedProductIds.Contains(prod.Id)) continue;

                    resultList.Add(new ShowroomInventoryDto
                    {
                        ShowroomId = request.ShowroomId,
                        ProductId = prod.Id,
                        ProductVariantSkuId = null,
                        ProductName = prod.Name,
                        ProductImage = !string.IsNullOrEmpty(prod.Image) ? prod.Image : string.Empty,
                        SkuCode = prod.Sku,
                        VariantInfo = "Tiêu chuẩn / Mặc định",
                        Price = prod.SalePrice ?? prod.Price,
                        Quantity = 0,
                        ReservedQuantity = 0,
                        IsAvailableFor2hDelivery = true,
                        UpdatedAt = null
                    });
                }

                // Sắp xếp: Ưu tiên có tồn kho trước, sau đó theo tên sản phẩm
                var sorted = resultList
                    .OrderByDescending(r => r.Quantity > 0)
                    .ThenBy(r => r.ProductName)
                    .ToList();

                return Result<List<ShowroomInventoryDto>>.Success(sorted);
            }
            catch (Exception ex)
            {
                return Result<List<ShowroomInventoryDto>>.BadRequest($"Lỗi khi lấy tồn kho cơ sở: {ex.Message}");
            }
        }
    }
}
