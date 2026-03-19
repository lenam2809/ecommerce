using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Entities;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces;
using Ecommerce.Domain.Interfaces.Logging;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.ExportProducts
{
    [Authorize(Policy = EPermissions.ViewProducts)]
    public class ExportProductsCommandHandler : IRequestHandler<ExportProductsCommand, Result<ExportProductsResult>>
    {
        private readonly IExcelService _excelService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEnhancedLogger _logger;

        public ExportProductsCommandHandler(
            IExcelService excelService,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEnhancedLogger logger)
        {
            _excelService = excelService;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<Result<ExportProductsResult>> Handle(ExportProductsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Lấy danh sách sản phẩm từ database
                IEnumerable<Product> products;

                if (request.ProductIds != null && request.ProductIds.Any())
                {
                    // Lấy các sản phẩm theo ID
                    products = await _unitOfWork.Products.GetProductsByIdsAsync(request.ProductIds, cancellationToken);
                }
                else
                {
                    // Lấy tất cả sản phẩm
                    products = await _unitOfWork.Products.GetAllAsync(cancellationToken);

                    // Lọc sản phẩm không hoạt động nếu cần
                    if (!request.IncludeInactive)
                    {
                        products = products.Where(p => p.IsActive);
                    }
                }

                // Map sang DTO để export
                var productDtos = MapProductsToExportDto(products);

                // Tạo tên file
                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                string fileFormat = request.Format.ToLower();
                string fileName = $"Products_Export_{timestamp}.{fileFormat}";
                string contentType;
                byte[] fileData;

                // Export theo định dạng
                if (fileFormat == "csv")
                {
                    fileData = await _excelService.ExportToCsvAsync(productDtos);
                    contentType = "text/csv";
                }
                else
                {
                    fileData = await _excelService.ExportToExcelAsync(productDtos, "Products");
                    contentType = fileFormat == "xls"
                        ? "application/vnd.ms-excel"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                }

                await _logger.LogAsync(Domain.Enums.ELogLevel.Information,
                    $"Đã xuất {productDtos.Count} sản phẩm sang định dạng {fileFormat}",
                    "Xuất sản phẩm");

                // Trả về kết quả
                return Result<ExportProductsResult>.Success(new ExportProductsResult
                {
                    FileData = fileData,
                    FileName = fileName,
                    ContentType = contentType,
                    RecordCount = productDtos.Count
                });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi xuất sản phẩm");
                return Result<ExportProductsResult>.BadRequest($"Xuất dữ liệu thất bại: {ex.Message}");
            }
        }

        private List<ProductImportExportDto> MapProductsToExportDto(IEnumerable<Product> products)
        {
            var result = new List<ProductImportExportDto>();

            foreach (var product in products)
            {
                var dto = _mapper.Map<ProductImportExportDto>(product);

                // Lấy tên Category và Brand
                dto.CategoryName = product.Category?.Name;
                dto.BrandName = product.Brand?.Name;

                // Xử lý ảnh phụ
                if (product.Images != null && product.Images.Any())
                {
                    dto.AdditionalImages = string.Join(",", product.Images.Select(i => i.Url));
                }

                // Xử lý specifications
                if (product.Specifications != null && product.Specifications.Any())
                {
                    dto.Specifications = string.Join(",",
                        product.Specifications.Select(s => $"{s.Name}:{s.Value}"));
                }

                // Xử lý variants
                if (product.Variants != null)
                {
                    if (product.Variants.Colors != null && product.Variants.Colors.Any())
                    {
                        dto.Colors = string.Join(",", product.Variants.Colors.Select(c => c.Color));
                    }

                    if (product.Variants.Sizes != null && product.Variants.Sizes.Any())
                    {
                        dto.Sizes = string.Join(",", product.Variants.Sizes.Select(s => s.Size));
                    }
                }

                result.Add(dto);
            }

            return result;
        }
    }
}
