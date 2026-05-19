using AutoMapper;
using Ecommerce.Application.Common.Constants;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Ecommerce.Application.Features.Products.Queries.GetPagedProducts
{
    [Authorize(Policy = EPermissions.ViewProducts)]
    public class GetPagedProductsQueryHandler : IRequestHandler<GetPagedProductsQuery, Result<PaginatedList<ProductDto>>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;
        private readonly ICacheService _cacheService;
        private readonly ICurrentUserService _currentUserService;

        public GetPagedProductsQueryHandler(IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService,
            ICacheService cacheService,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
            _cacheService = cacheService;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PaginatedList<ProductDto>>> Handle(GetPagedProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var searchTerm = request.SearchTerm?.Trim() ?? string.Empty;
                var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "name";

                string filterRaw = $"{searchTerm.ToLowerInvariant()}" +
                    $"_{request.CategoryIds}" +
                    $"_{request.BrandIds}" +
                    $"_{request.Rating?.ToString() ?? "null"}" +
                    $"_{request.MinPrice?.ToString() ?? "null"}" +
                    $"_{request.MaxPrice?.ToString() ?? "null"}" +
                    $"_{sortBy}" +
                    $"_{request.IsDescending}";

                string filterHash = Convert.ToBase64String(System.Security.Cryptography.MD5.Create()
                    .ComputeHash(System.Text.Encoding.UTF8.GetBytes(filterRaw)));


                // C3 FIX: Bỏ UserId khỏi cache key vì products là public, không lọc theo user.
                // Trước: “get_paged_products_{userId}_{page}_{size}_{hash}” => phân mảnh cache, tỷ lệ hit thấp
                // D2: Dùng CacheKeys prefix thay vì magic string
                string cacheKey = $"{CachePrefixes.GetOptionProducts}paged:{request.PageNumber}:{request.PageSize}:{filterHash}";



                // Thử lấy từ cache
                var cachedResult = await _cacheService.GetAsync<PaginatedList<ProductDto>>(cacheKey);
                if (cachedResult != null)
                {
                    return Result<PaginatedList<ProductDto>>.Success(cachedResult);
                }

                var categoryIds = string.IsNullOrEmpty(request.CategoryIds)
                    ? []
                    : request.CategoryIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(Guid.Parse)
                        .ToList();

                var brandIds = string.IsNullOrEmpty(request.BrandIds)
                    ? []
                    : request.BrandIds.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(Guid.Parse)
                        .ToList();
                // Xây dựng biểu thức filter từ các tham số truy vấn
                Expression<Func<Product, bool>> filter = product =>
                    (string.IsNullOrEmpty(searchTerm) || product.Name.Contains(searchTerm)) &&
                    (string.IsNullOrEmpty(request.CategoryIds)
                        || categoryIds.Contains(product.CategoryId)) &&
                    (string.IsNullOrEmpty(request.BrandIds)
                        || brandIds.Contains(product.BrandId)) &&
                    (!request.Rating.HasValue || product.Rating >= request.Rating) &&
                    (!request.MinPrice.HasValue || product.Price >= request.MinPrice) &&
                    (!request.MaxPrice.HasValue || product.Price <= request.MaxPrice);

                // Xây dựng sắp xếp từ tham số SortBy và IsDescending
                Func<IQueryable<Product>, IOrderedQueryable<Product>> orderBy = query =>
                {
                    return sortBy switch
                    {
                        "price" => request.IsDescending
                            ? query.OrderByDescending(p => p.Price)
                            : query.OrderBy(p => p.Price),
                        "rating" => request.IsDescending
                            ? query.OrderByDescending(p => p.Rating)
                            : query.OrderBy(p => p.Rating),
                        _ => request.IsDescending
                            ? query.OrderByDescending(p => p.Name)
                            : query.OrderBy(p => p.Name)
                    };
                };

                // Gọi phương thức GetPaginatedAsync
                var paginatedResult = await _unitOfWork.Products
                    .GetPaginatedAsync(
                        filter: filter,
                        orderBy: orderBy,
                        pageIndex: request.PageNumber,
                        pageSize: request.PageSize,
                        cancellationToken: cancellationToken,
                        includeFunc: query => query
                            .Include(p => p.Category)
                            .Include(p => p.Brand)
                        );

                // Ánh xạ kết quả sang DTO
                var productDtos = _mapper.Map<List<ProductDto>>(paginatedResult.Items);
                var productIds = productDtos.Select(p => p.Id).ToList();

                // B2 FIX: Batch load SoldQuantity và WishlistStatus để tránh N+1 query
                // Trước: foreach => 2 queries/sản phẩm = 40 queries cho page=20
                // Sau: 2 queries tổng (1 cho sold quantity, 1 cho wishlist) bất kể page size

                // Query 1: Tổng số lượng đã bán cho tất cả product trong trang hiện tại
                var soldQuantityMap = await _unitOfWork.BaseRepository<OrderItem>()
                    .GetQueryable()
                    .Where(oi => productIds.Contains(oi.ProductId))
                    .GroupBy(oi => oi.ProductId)
                    .Select(g => new { ProductId = g.Key, Total = g.Sum(oi => oi.Quantity) })
                    .ToDictionaryAsync(x => x.ProductId, x => x.Total, cancellationToken);

                // Query 2: Sản phẩm nào đang trong wishlist của bất kỳ user nào
                var inWishlistSet = await _unitOfWork.BaseRepository<WishlistItem>()
                    .GetQueryable()
                    .Where(wi => productIds.Contains(wi.ProductId))
                    .Select(wi => wi.ProductId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                // Gán MainImage + SoldQuantity + AllowDelete trong bộ nhớ (không có round-trip)
                foreach (var productDto in productDtos)
                {
                    productDto.MainImage = await _fileStorageService.GetFileUrlAsync(productDto.MainImage);
                    productDto.SoldQuantity = soldQuantityMap.TryGetValue(productDto.Id, out var qty) ? qty : 0;
                    productDto.AllowDelete = !inWishlistSet.Contains(productDto.Id);
                }

                // Tạo kết quả trả về
                var result = new PaginatedList<ProductDto>(
                    productDtos,
                    paginatedResult.TotalCount,
                    paginatedResult.PageIndex,
                    paginatedResult.PageSize);

                // Lưu kết quả vào cache trong 10 phút
                await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(10));

                return Result<PaginatedList<ProductDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<ProductDto>>.BadRequest(ex.Message);
            }
        }
    }
}

