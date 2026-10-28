using Ecommerce.Application.Common.Models;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Showrooms.Commands.TransferShowroomStock
{
    public class TransferShowroomStockCommandHandler : IRequestHandler<TransferShowroomStockCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public TransferShowroomStockCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(TransferShowroomStockCommand request, CancellationToken cancellationToken)
        {
            var fromShowroom = await _unitOfWork.BaseRepository<Showroom>()
                .GetByIdAsync(request.FromShowroomId, cancellationToken);

            if (fromShowroom == null)
            {
                return Result<bool>.NotFound("Showroom xuất không tồn tại trong hệ thống");
            }

            var toShowroom = await _unitOfWork.BaseRepository<Showroom>()
                .GetByIdAsync(request.ToShowroomId, cancellationToken);

            if (toShowroom == null)
            {
                return Result<bool>.NotFound("Showroom nhận không tồn tại trong hệ thống");
            }

            var product = await _unitOfWork.Products
                .GetByIdAsync(request.ProductId, cancellationToken);

            if (product == null)
            {
                return Result<bool>.NotFound("Sản phẩm điều chuyển không tồn tại trong hệ thống");
            }

            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                // 1. Kiểm tra tồn kho khả dụng tại showroom nguồn
                var fromInventory = await _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable(tracking: true)
                    .FirstOrDefaultAsync(i => i.ShowroomId == request.FromShowroomId && i.ProductId == request.ProductId, cancellationToken);

                var availableStock = fromInventory != null ? (fromInventory.Quantity - fromInventory.ReservedQuantity) : 0;
                if (fromInventory == null || availableStock < request.Quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result<bool>.BadRequest(
                        $"Cơ sở nguồn '{fromShowroom.Name}' không đủ tồn kho khả dụng. Khả dụng: {availableStock}, yêu cầu: {request.Quantity}");
                }

                // 2. Trừ tồn kho tại showroom nguồn
                fromInventory.Quantity -= request.Quantity;
                fromInventory.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.BaseRepository<ShowroomInventory>().Update(fromInventory);

                // 3. Tăng tồn kho tại showroom đích
                var toInventory = await _unitOfWork.BaseRepository<ShowroomInventory>()
                    .GetQueryable(tracking: true)
                    .FirstOrDefaultAsync(i => i.ShowroomId == request.ToShowroomId && i.ProductId == request.ProductId, cancellationToken);

                if (toInventory != null)
                {
                    toInventory.Quantity += request.Quantity;
                    if (!toInventory.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty)
                    {
                        toInventory.ProductVariantSkuId = request.ProductVariantSkuId;
                    }
                    toInventory.UpdatedAt = DateTime.UtcNow;
                    _unitOfWork.BaseRepository<ShowroomInventory>().Update(toInventory);
                }
                else
                {
                    toInventory = new ShowroomInventory
                    {
                        ShowroomId = request.ToShowroomId,
                        ProductId = request.ProductId,
                        ProductVariantSkuId = request.ProductVariantSkuId.HasValue && request.ProductVariantSkuId.Value != Guid.Empty
                            ? request.ProductVariantSkuId
                            : fromInventory.ProductVariantSkuId,
                        Quantity = request.Quantity,
                        ReservedQuantity = 0,
                        IsAvailableFor2hDelivery = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.BaseRepository<ShowroomInventory>().AddAsync(toInventory, cancellationToken);
                }

                await _unitOfWork.CompleteAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                return Result<bool>.Success(true);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result<bool>.BadRequest($"Lỗi trong quá trình điều chuyển tồn kho: {ex.Message}");
            }
        }
    }
}
