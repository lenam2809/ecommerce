using AutoMapper;
using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Application.Features.Products.Helpers;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Application.Features.Products.Queries.CompareProducts
{
    public class CompareProductsQueryHandler : IRequestHandler<CompareProductsQuery, Result<ProductComparisonDto>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IFileStorageService _fileStorageService;

        public CompareProductsQueryHandler(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IFileStorageService fileStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _fileStorageService = fileStorageService;
        }

        public async Task<Result<ProductComparisonDto>> Handle(CompareProductsQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var targetGuids = new List<Guid>();
                var targetTokens = new List<string>();

                if (request.ProductIds != null && request.ProductIds.Any())
                {
                    targetGuids.AddRange(request.ProductIds.Where(id => id != Guid.Empty));
                }
                else if (!string.IsNullOrWhiteSpace(request.Ids))
                {
                    var idStrings = request.Ids.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var idStr in idStrings)
                    {
                        var trimmed = idStr.Trim();
                        if (Guid.TryParse(trimmed, out var parsedId))
                        {
                            targetGuids.Add(parsedId);
                        }
                        else if (!string.IsNullOrWhiteSpace(trimmed))
                        {
                            targetTokens.Add(trimmed);
                        }
                    }
                }

                if (!targetGuids.Any() && !targetTokens.Any())
                {
                    return Result<ProductComparisonDto>.BadRequest("Cần cung cấp ít nhất một mã sản phẩm để so sánh (ids=id1,id2).");
                }

                var query = _unitOfWork.Products
                    .GetQueryable()
                    .AsNoTracking()
                    .Include(p => p.Category)
                    .Include(p => p.Brand)
                    .Include(p => p.Specifications)
                    .AsQueryable();

                if (targetGuids.Any() && targetTokens.Any())
                {
                    query = query.Where(p => targetGuids.Contains(p.Id) || targetTokens.Contains(p.Code) || targetTokens.Contains(p.Slug));
                }
                else if (targetGuids.Any())
                {
                    query = query.Where(p => targetGuids.Contains(p.Id));
                }
                else
                {
                    query = query.Where(p => targetTokens.Contains(p.Code) || targetTokens.Contains(p.Slug));
                }

                var products = await query.ToListAsync(cancellationToken);

                var orderedProducts = new List<Product>();
                if (targetGuids.Any() && !targetTokens.Any())
                {
                    foreach (var id in targetGuids.Distinct().Take(4))
                    {
                        var prod = products.FirstOrDefault(p => p.Id == id);
                        if (prod != null && !orderedProducts.Contains(prod))
                        {
                            orderedProducts.Add(prod);
                        }
                    }
                }
                else
                {
                    var allKeys = (request.Ids ?? string.Empty).Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(k => k.Trim())
                        .ToList();

                    foreach (var key in allKeys)
                    {
                        var prod = products.FirstOrDefault(p =>
                            p.Id.ToString().Equals(key, StringComparison.OrdinalIgnoreCase) ||
                            p.Code.Equals(key, StringComparison.OrdinalIgnoreCase) ||
                            p.Slug.Equals(key, StringComparison.OrdinalIgnoreCase));

                        if (prod != null && !orderedProducts.Contains(prod))
                        {
                            orderedProducts.Add(prod);
                            if (orderedProducts.Count >= 4) break;
                        }
                    }

                    foreach (var prod in products)
                    {
                        if (orderedProducts.Count >= 4) break;
                        if (!orderedProducts.Contains(prod))
                        {
                            orderedProducts.Add(prod);
                        }
                    }
                }

                if (!orderedProducts.Any())
                {
                    return Result<ProductComparisonDto>.NotFound("Không tìm thấy sản phẩm nào phù hợp để so sánh.");
                }

                var productDtos = _mapper.Map<List<ProductDto>>(orderedProducts);
                for (int i = 0; i < productDtos.Count; i++)
                {
                    var p = orderedProducts[i];
                    var dto = productDtos[i];
                    dto.MainImage = await _fileStorageService.GetFileUrlAsync(dto.MainImage);
                    dto.KeySpecs = ProductSpecHelper.ExtractKeySpecs(p.Specifications, p.Name, p.Category?.Name);
                }

                // Group specifications across all products
                var groupNames = orderedProducts
                    .SelectMany(p => p.Specifications.Select(s => string.IsNullOrWhiteSpace(s.GroupName) ? "Thông số chung" : s.GroupName.Trim()))
                    .Distinct()
                    .ToList();

                if (!groupNames.Any())
                {
                    groupNames.Add("Thông số chung");
                }

                var specGroups = new List<ComparisonSpecGroupDto>();

                foreach (var groupName in groupNames)
                {
                    var groupSpecs = orderedProducts
                        .SelectMany(p => p.Specifications
                            .Where(s => (string.IsNullOrWhiteSpace(s.GroupName) && groupName == "Thông số chung") ||
                                        (!string.IsNullOrWhiteSpace(s.GroupName) && s.GroupName.Trim().Equals(groupName, StringComparison.OrdinalIgnoreCase))))
                        .OrderBy(s => s.DisplayOrder)
                        .Select(s => s.Name.Trim())
                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToList();

                    if (!groupSpecs.Any()) continue;

                    var specRows = new List<ComparisonSpecRowDto>();
                    foreach (var specName in groupSpecs)
                    {
                        var row = new ComparisonSpecRowDto
                        {
                            Name = specName,
                            Values = new Dictionary<string, string>()
                        };

                        foreach (var prod in orderedProducts)
                        {
                            var match = prod.Specifications.FirstOrDefault(s =>
                                s.Name.Trim().Equals(specName, StringComparison.OrdinalIgnoreCase) &&
                                ((string.IsNullOrWhiteSpace(s.GroupName) && groupName == "Thông số chung") ||
                                 (!string.IsNullOrWhiteSpace(s.GroupName) && s.GroupName.Trim().Equals(groupName, StringComparison.OrdinalIgnoreCase))));

                            var val = match?.Value?.Trim() ?? "—";
                            row.Values[prod.Id.ToString()] = val;
                            if (!string.IsNullOrWhiteSpace(prod.Code) && !row.Values.ContainsKey(prod.Code))
                            {
                                row.Values[prod.Code] = val;
                            }
                        }

                        specRows.Add(row);
                    }

                    specGroups.Add(new ComparisonSpecGroupDto
                    {
                        GroupName = groupName,
                        Specs = specRows
                    });
                }

                var comparisonResult = new ProductComparisonDto
                {
                    Products = productDtos,
                    SpecGroups = specGroups
                };

                return Result<ProductComparisonDto>.Success(comparisonResult);
            }
            catch (Exception ex)
            {
                return Result<ProductComparisonDto>.BadRequest($"Lỗi khi so sánh sản phẩm: {ex.Message}");
            }
        }
    }
}
