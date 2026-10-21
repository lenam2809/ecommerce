using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Showrooms.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Queries.CheckShowroomStock
{
    public class CheckShowroomStockQueryHandler : IRequestHandler<CheckShowroomStockQuery, Result<List<ShowroomStockDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CheckShowroomStockQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<ShowroomStockDto>>> Handle(CheckShowroomStockQuery request, CancellationToken cancellationToken)
        {
            try
            {
                if (request.ProductId == Guid.Empty)
                {
                    return Result<List<ShowroomStockDto>>.BadRequest("ProductId không hợp lệ.");
                }

                // 1. Get all active showrooms
                var showrooms = await _unitOfWork.BaseRepository<Showroom>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.DisplayOrder)
                    .ThenBy(s => s.Name)
                    .ToListAsync(cancellationToken);

                // 2. Query inventories for this product
                var inventoryQuery = _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(i => i.ProductId == request.ProductId);

                if (request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty)
                {
                    inventoryQuery = inventoryQuery.Where(i => i.ProductVariantSkuId == request.ProductVariantSkuId.Value);
                }

                var inventories = await inventoryQuery.ToListAsync(cancellationToken);
                var inventoryByShowroom = inventories
                    .GroupBy(i => i.ShowroomId)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

                var result = showrooms.Select(s =>
                {
                    var qty = inventoryByShowroom.TryGetValue(s.Id, out var quantity) ? quantity : 0;
                    return new ShowroomStockDto
                    {
                        ShowroomId = s.Id,
                        Code = s.Code,
                        Name = s.Name,
                        Region = s.Region,
                        City = s.City,
                        Province = s.Province,
                        District = s.District,
                        Address = s.Address,
                        Phone = s.Phone,
                        Quantity = qty,
                        IsAvailableFor2hDelivery = s.HasInstantPickup && qty > 0,
                        HasInstantPickup = s.HasInstantPickup
                    };
                }).ToList();

                return Result<List<ShowroomStockDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<List<ShowroomStockDto>>.BadRequest($"Lỗi khi kiểm tra tồn kho showroom: {ex.Message}");
            }
        }
    }
}
