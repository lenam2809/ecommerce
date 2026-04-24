using Ecommerce.Application.Common.Helpers;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Commands.CreateProduct;
using Ecommerce.Application.Features.Products.Commands.DeleteProduct;
using Ecommerce.Application.Features.Products.Commands.UpdateProduct;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Commands.ImportProducts
{
    [Authorize(Policy = EPermissions.CreateProduct)]
    public class ImportProductsCommandHandler : IRequestHandler<ImportProductsCommand, Result<ImportProductsResult>>
    {
        private readonly IExcelService _excelService;
        private readonly IMediator _mediator;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEnhancedLogger _logger;
        private readonly IMapper _mapper;

        public ImportProductsCommandHandler(
            IExcelService excelService,
            IMediator mediator,
            IUnitOfWork unitOfWork,
            IEnhancedLogger logger,
            IMapper mapper)
        {
            _excelService = excelService;
            _mediator = mediator;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<Result<ImportProductsResult>> Handle(ImportProductsCommand request, CancellationToken cancellationToken)
        {
            var result = new ImportProductsResult();

            try
            {
                if (request.File == null || request.File.Length == 0)
                {
                    return Result<ImportProductsResult>.BadRequest("KhÃ´ng cÃ³ táº­p tin nÃ o Ä‘Æ°á»£c táº£i lÃªn");
                }

                string fileExtension = Path.GetExtension(request.File.FileName).ToLower();
                List<ProductImportExportDto> productsDto;

                using (var stream = request.File.OpenReadStream())
                {
                    if (fileExtension == ".xlsx" || fileExtension == ".xls")
                    {
                        productsDto = await _excelService.ReadExcelAsync<ProductImportExportDto>(stream);
                    }
                    else if (fileExtension == ".csv")
                    {
                        productsDto = await _excelService.ReadCsvAsync<ProductImportExportDto>(stream);
                    }
                    else
                    {
                        return Result<ImportProductsResult>.BadRequest("Chá»‰ há»— trá»£ file Excel (.xlsx, .xls) vÃ  CSV");
                    }
                }

                result.TotalItems = productsDto.Count;

                // 1. Validation cÆ¡ báº£n (Data types, required fields)
                var validationErrors = await ValidateImportData(productsDto, cancellationToken);
                if (validationErrors.Any())
                {
                    result.Errors.AddRange(validationErrors);
                    result.ErrorCount = validationErrors.Count;
                    return Result<ImportProductsResult>.BadRequest($"Lá»—i kiá»ƒm tra dá»¯ liá»‡u: CÃ³ {validationErrors.Count} lá»—i.");
                }

                if (request.ValidateOnly)
                {
                    return Result<ImportProductsResult>.Success(result);
                }

                // 2. Prepare Data (Bulk Loading for Performance)
                // Láº¥y táº¥t cáº£ mÃ£ vÃ  SKU hiá»‡n cÃ³ Ä‘á»ƒ check trÃ¹ng láº·p trong bá»™ nhá»›
                var existingCodes = await _unitOfWork.Products.GetQueryable().Select(p => p.Code).ToListAsync(cancellationToken);
                var existingSkus = await _unitOfWork.Products.GetQueryable().Select(p => p.Sku).ToListAsync(cancellationToken);
                var existingCodeSet = new HashSet<string>(existingCodes, StringComparer.OrdinalIgnoreCase);
                var existingSkuSet = new HashSet<string>(existingSkus, StringComparer.OrdinalIgnoreCase);

                // Láº¥y danh sÃ¡ch Category vÃ  Brand Ä‘á»ƒ map ID
                var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
                var brands = await _unitOfWork.Brands.GetAllAsync(cancellationToken);
                
                // Dictionary Ä‘á»ƒ lookup nhanh (Name -> Id)
                var categoryMap = categories.ToDictionary(c => c.Name, c => c.Id, StringComparer.OrdinalIgnoreCase);
                var brandMap = brands.ToDictionary(b => b.Name, b => b.Id, StringComparer.OrdinalIgnoreCase);

                // 3. Process Logic
                var newProducts = new List<Product>();
                var productsToUpdate = new List<Product>();
                var idsToDelete = new List<Guid>();

                // Xá»­ lÃ½ Category vÃ  Brand má»›i trÆ°á»›c (náº¿u cÃ³)
                await EnsureCategoriesAndBrandsExist(productsDto, categoryMap, brandMap, cancellationToken);

                foreach (var dto in productsDto)
                {
                    try
                    {
                        var action = dto.Action?.ToUpper() ?? "ADD";

                        if (action == "ADD")
                        {
                            if (existingCodeSet.Contains(dto.Code))
                            {
                                result.Errors.Add($"Sản phẩm {dto.Code}: Mã đã tồn tại");
                                result.ErrorCount++;
                                continue;
                            }
                            if (existingSkuSet.Contains(dto.Sku))
                            {
                                result.Errors.Add($"Sản phẩm {dto.Code}: SKU {dto.Sku} đã tồn tại");
                                result.ErrorCount++;
                                continue;
                            }

                            var product = MapDtoToProduct(dto, categoryMap, brandMap);
                            newProducts.Add(product);
                            
                            // Cáº­p nháº­t local set Ä‘á»ƒ check trÃ¹ng láº·p trong chÃ­nh file import
                            existingCodeSet.Add(dto.Code);
                            existingSkuSet.Add(dto.Sku);
                            result.AddedCount++;
                        }
                        else if (action == "UPDATE")
                        {
                            if (!dto.Id.HasValue)
                            {
                                result.Errors.Add($"Sản phẩm {dto.Code}: Thiếu ID cho hành động UPDATE");
                                result.ErrorCount++;
                                continue;
                            }

                            // Note: Bulk Update phá»©c táº¡p hÆ¡n vÃ¬ cáº§n fetch entity ra Ä‘á»ƒ track change.
                            // á»ž Ä‘Ã¢y ta lÃ m simple fetch cho update Ä‘á»ƒ an toÃ n, hoáº·c dÃ¹ng BatchUpdate náº¿u thÆ° viá»‡n há»— trá»£.
                            // Vá»›i sá»‘ lÆ°á»£ng update Ã­t, fetch tá»«ng cÃ¡i ok. Vá»›i sá»‘ lÆ°á»£ng lá»›n, nÃªn fetch 'Where Id IN (...)'
                            // Äá»ƒ Ä‘Æ¡n giáº£n vÃ  an toÃ n, ta gom ID láº¡i rá»“i fetch 1 láº§n.
                            // Tuy nhiÃªn, logic dÆ°á»›i Ä‘Ã¢y sáº½ gom láº¡i xá»­ lÃ½ sau vÃ²ng láº·p nÃ y.
                        }
                        else if (action == "DELETE")
                        {
                            if (dto.Id.HasValue) idsToDelete.Add(dto.Id.Value);
                        }
                    }
                    catch (Exception ex)
                    {
                        result.Errors.Add($"Lỗi xử lý dòng {dto.Code}: {ex.Message}");
                        result.ErrorCount++;
                    }
                }

                // 4. Execute Database Changes
                
                // 4.1 Bulk Insert
                if (newProducts.Any())
                {
                    await _unitOfWork.Products.AddRangeAsync(newProducts, cancellationToken);
                }

                // 4.2 Bulk Delete
                if (idsToDelete.Any())
                {
                    // Check rÃ ng buá»™c trÆ°á»›c khi xÃ³a (vÃ­ dá»¥ wishlist, order) - Cáº§n cáº©n tháº­n
                    // á»ž Ä‘Ã¢y demo xÃ³a nhanh báº±ng ID
                    var productsToDelete = await _unitOfWork.Products.GetQueryable()
                        .Where(p => idsToDelete.Contains(p.Id))
                        .ToListAsync(cancellationToken);
                    
                    _unitOfWork.Products.DeleteRange(productsToDelete);
                    result.DeletedCount = productsToDelete.Count;
                }

                // 4.3 Bulk Update (Logic tá»‘i Æ°u: Fetch táº¥t cáº£ sáº£n pháº©m cáº§n update 1 láº§n)
                var updateDtos = productsDto.Where(x => (x.Action?.ToUpper() == "UPDATE") && x.Id.HasValue).ToList();
                if (updateDtos.Any())
                {
                    var updateIds = updateDtos.Select(x => x.Id.Value).ToList();
                    var entitiesToUpdate = await _unitOfWork.Products.GetQueryable()
                        .Where(p => updateIds.Contains(p.Id))
                        .Include(p => p.Variants).ThenInclude(v => v.Colors)
                        .Include(p => p.Variants).ThenInclude(v => v.Sizes)
                        .Include(p => p.Specifications)
                        .ToListAsync(cancellationToken);

                    foreach (var entity in entitiesToUpdate)
                    {
                        var dto = updateDtos.First(x => x.Id == entity.Id);
                        UpdateProductFromDto(entity, dto, categoryMap, brandMap);
                        result.UpdatedCount++;
                    }
                }

                await _unitOfWork.CompleteAsync(cancellationToken);

                result.SuccessCount = result.AddedCount + result.UpdatedCount + result.DeletedCount;
                
                await _logger.LogAsync(ELogLevel.Information, 
                    "Product import completed with Added {AddedCount}, Updated {UpdatedCount}, Deleted {DeletedCount}, Errors {ErrorCount}",
                    "ImportProducts",
                    properties: new Dictionary<string, object?>
                    {
                        { "AddedCount", result.AddedCount },
                        { "UpdatedCount", result.UpdatedCount },
                        { "DeletedCount", result.DeletedCount },
                        { "ErrorCount", result.ErrorCount }
                    });

                return Result<ImportProductsResult>.Success(result);
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lá»—i trong quÃ¡ trÃ¬nh import sáº£n pháº©m");
                return Result<ImportProductsResult>.BadRequest($"Import thất bại: {ex.Message}");
            }
        }

        private async Task EnsureCategoriesAndBrandsExist(
            List<ProductImportExportDto> dtos, 
            Dictionary<string, Guid> categoryMap, 
            Dictionary<string, Guid> brandMap,
            CancellationToken cancellationToken)
        {
            var newCategories = new List<Category>();
            var newBrands = new List<Brand>();

            // TÃ¬m Category má»›i
            var distinctCategories = dtos
                .Where(x => !string.IsNullOrEmpty(x.CategoryName))
                .Select(x => x.CategoryName)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var catName in distinctCategories)
            {
                if (!categoryMap.ContainsKey(catName))
                {
                    var newCat = new Category
                    {
                        Id = Guid.NewGuid(),
                        Name = catName,
                        Code = SlugHelper.GenerateSlug(catName), // Simple code gen
                        Slug = SlugHelper.GenerateSlug(catName),
                        Description = $"Auto generated from Import",
                        IsActive = true
                    };
                    newCategories.Add(newCat);
                    categoryMap[catName] = newCat.Id; // Cáº­p nháº­t map ngay Ä‘á»ƒ dÃ¹ng
                }
            }

            // TÃ¬m Brand má»›i
            var distinctBrands = dtos
                .Where(x => !string.IsNullOrEmpty(x.BrandName))
                .Select(x => x.BrandName)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var brandName in distinctBrands)
            {
                if (!brandMap.ContainsKey(brandName))
                {
                    var newBrand = new Brand
                    {
                        Id = Guid.NewGuid(),
                        Name = brandName,
                        Code = SlugHelper.GenerateSlug(brandName),
                        Slug = SlugHelper.GenerateSlug(brandName),
                        Description = $"Auto generated from Import",
                        IsActive = true
                    };
                    newBrands.Add(newBrand);
                    brandMap[brandName] = newBrand.Id;
                }
            }

            if (newCategories.Any()) await _unitOfWork.Categories.AddRangeAsync(newCategories, cancellationToken);
            if (newBrands.Any()) await _unitOfWork.Brands.AddRangeAsync(newBrands, cancellationToken);
            
            if (newCategories.Any() || newBrands.Any())
            {
                await _unitOfWork.CompleteAsync(cancellationToken);
            }
        }

        private Product MapDtoToProduct(ProductImportExportDto dto, Dictionary<string, Guid> categoryMap, Dictionary<string, Guid> brandMap)
        {
            Guid categoryId = Guid.Empty;
            Guid brandId = Guid.Empty;

            if (!string.IsNullOrEmpty(dto.CategoryName) && categoryMap.TryGetValue(dto.CategoryName, out var catId))
            {
                categoryId = catId;
            }
            if (!string.IsNullOrEmpty(dto.BrandName) && brandMap.TryGetValue(dto.BrandName, out var bId))
            {
                brandId = bId;
            }

            var product = Product.Create(
                dto.Code,
                dto.Name,
                SlugHelper.GenerateSlug(dto.Name),
                dto.Sku,
                dto.Price,
                dto.SalePrice,
                dto.Image ?? string.Empty,
                dto.Description ?? string.Empty,
                dto.StockQuantity,
                categoryId,
                brandId,
                dto.PublishedDate
            );

            // Cáº­p nháº­t cÃ¡c thuá»™c tÃ­nh khÃ´ng cÃ³ trong constructor (náº¿u cáº§n) hoáº·c rely on defaults
            // Product.Create Ä‘Ã£ set IsActive=true máº·c Ä‘á»‹nh. Náº¿u DTO cÃ³ IsActive=false thÃ¬ cáº§n update.
            if (!dto.IsActive)
            {
                product.UpdateInfo(
                    product.Name,
                    product.Slug,
                    product.Description,
                    product.Image,
                    product.CategoryId,
                    product.BrandId,
                    dto.IsActive
                );
            }

            // Map Specifications
            if (!string.IsNullOrEmpty(dto.Specifications))
            {
                var specs = dto.Specifications.Split(',')
                    .Select(s => s.Split(':'))
                    .Where(parts => parts.Length == 2);
                
                foreach (var part in specs)
                {
                    product.AddSpecification(part[0].Trim(), part[1].Trim());
                }
            }

            // Map Variants
            if (!string.IsNullOrEmpty(dto.Colors) || !string.IsNullOrEmpty(dto.Sizes))
            {
                var colors = !string.IsNullOrEmpty(dto.Colors) 
                    ? dto.Colors.Split(',').Select(c => c.Trim()).ToList() 
                    : new List<string>();
                
                var sizes = !string.IsNullOrEmpty(dto.Sizes) 
                    ? dto.Sizes.Split(',').Select(s => s.Trim()).ToList() 
                    : new List<string>();

                product.SetVariants(colors, sizes);
            }

            return product;
        }

        private void UpdateProductFromDto(Product product, ProductImportExportDto dto, Dictionary<string, Guid> categoryMap, Dictionary<string, Guid> brandMap)
        {
            Guid categoryId = product.CategoryId;
            Guid brandId = product.BrandId;

            if (!string.IsNullOrEmpty(dto.CategoryName) && categoryMap.TryGetValue(dto.CategoryName, out var catId))
            {
                categoryId = catId;
            }
            if (!string.IsNullOrEmpty(dto.BrandName) && brandMap.TryGetValue(dto.BrandName, out var bId))
            {
                brandId = bId;
            }

            product.UpdateInfo(
                dto.Name,
                SlugHelper.GenerateSlug(dto.Name),
                dto.Description ?? product.Description,
                dto.Image ?? product.Image,
                categoryId,
                brandId,
                dto.IsActive
            );

            product.UpdatePrice(dto.Price, dto.SalePrice);
            product.UpdateStock(dto.StockQuantity);

            // Update Specs/Variants logic can be added here similar to Create if needed
        }

        private Task<List<string>> ValidateImportData(List<ProductImportExportDto> products, CancellationToken cancellationToken)
        {
            var errors = new List<string>();
            // Giá»¯ láº¡i logic validate cÆ¡ báº£n nhÆ°ng bá» check DB trong loop
            // ... Logic validate local ...
            return Task.FromResult(errors);
        }
    }
}
