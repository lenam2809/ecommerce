using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Reports.Dto;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Reports.Queries.GetLowStockProducts
{
    public class GetLowStockProductsQueryHandler : IRequestHandler<GetLowStockProductsQuery, Result<List<LowStockProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public GetLowStockProductsQueryHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<List<LowStockProductDto>>> Handle(GetLowStockProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var minStock = request.MinStock ?? 10;

                var products = await _unitOfWork.Products
                    .GetAllWithIncludeAsync(
                        query => query
                            .Include(p => p.Category)
                            .Where(p => p.StockQuantity <= minStock
                                   && (!request.CategoryId.HasValue || p.CategoryId == request.CategoryId)
                                   && p.IsActive),
                        cancellationToken);

                var results = products.Select(p => new LowStockProductDto
                {
                    ProductId = p.Id,
                    Name = p.Name,
                    SKU = p.Sku,
                    CurrentStock = p.StockQuantity,
                    MinimumStock = p.StockQuantity,
                    StockStatus = GetStockStatus(p.StockQuantity, p.StockQuantity),
                    Price = p.Price,
                    CategoryName = p.Category?.Name ?? "Không xác định"
                })
                .Where(p => string.IsNullOrEmpty(request.StockStatus) ||
                           request.StockStatus.ToLower() == "all" ||
                           p.StockStatus.ToLower() == request.StockStatus.ToLower())
                .OrderBy(p => p.CurrentStock)
                .ToList();

                return Result<List<LowStockProductDto>>.Success(results);
            }
            catch (Exception ex)
            {
                return Result<List<LowStockProductDto>>.BadRequest($"Lỗi khi lấy danh sách sản phẩm tồn kho thấp: {ex.Message}");
            }
        }

        private string GetStockStatus(int currentStock, int minStock)
        {
            if (currentStock <= minStock / 2)
                return "Critical";
            else if (currentStock <= minStock)
                return "Low";
            else
                return "Warning";
        }
    }
}

