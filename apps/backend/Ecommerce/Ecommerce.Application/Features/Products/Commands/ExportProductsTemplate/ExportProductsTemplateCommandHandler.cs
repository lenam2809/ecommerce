using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using Ecommerce.Domain.Enums;
using Ecommerce.Domain.Interfaces.Logging;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace Ecommerce.Application.Features.Products.Commands.ExportProductsTemplate
{
    [Authorize(Policy = EPermissions.CreateProduct)]
    public class ExportProductsTemplateCommandHandler : IRequestHandler<ExportProductsTemplateCommand, Result<ExportTemplateResult>>
    {
        private readonly IExcelService _excelService;
        private readonly IEnhancedLogger _logger;

        public ExportProductsTemplateCommandHandler(
            IExcelService excelService,
            IEnhancedLogger logger)
        {
            _excelService = excelService;
            _logger = logger;
        }

        public async Task<Result<ExportTemplateResult>> Handle(ExportProductsTemplateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Tạo mẫu template với một item mẫu
                var templateItems = new List<ProductImportExportDto>
                {
                    new ProductImportExportDto
                    {
                        Action = "ADD", // ADD, UPDATE, DELETE
                        Id = Guid.Empty, // Chỉ cần cho UPDATE hoặc DELETE
                        Code = "SAMPLE-001",
                        Name = "Tên sản phẩm mẫu",
                        Sku = "SKU-001",
                        Price = 100000,
                        SalePrice = 90000,
                        Rating = 4.5,
                        ReviewCount = 10,
                        Description = "Mô tả sản phẩm mẫu.",
                        StockQuantity = 100,
                        PublishedDate = DateTime.Now,
                        IsActive = true,
                        CategoryId = Guid.Empty, // Chỉ cần cho UPDATE
                        CategoryName = "Danh mục mẫu",
                        BrandId = Guid.Empty, // Chỉ cần cho UPDATE
                        BrandName = "Thương hiệu mẫu",
                        Image = "product-image.jpg",
                        AdditionalImages = "image1.jpg,image2.jpg,image3.jpg",
                        Colors = "Red,Blue,Green",
                        Sizes = "S,M,L,XL",
                        Specifications = "Material:Cotton,Weight:300g,Origin:Vietnam"
                    }
                };

                // Tạo tên file
                string timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                string fileFormat = request.Format.ToLower();
                string fileName = $"Products_Import_Template.{fileFormat}";
                string contentType;
                byte[] fileData;

                // Export theo định dạng
                if (fileFormat == "csv")
                {
                    fileData = await _excelService.ExportToCsvAsync(templateItems);
                    contentType = "text/csv";
                }
                else
                {
                    fileData = await _excelService.ExportToExcelAsync(templateItems, "Template");
                    contentType = fileFormat == "xls"
                        ? "application/vnd.ms-excel"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                }

                await _logger.LogAsync(Domain.Enums.ELogLevel.Information,
                    $"Đã tạo mẫu import sản phẩm theo định dạng {fileFormat}",
                    "Tạo mẫu sản phẩm");

                // Trả về kết quả
                return Result<ExportTemplateResult>.Success(new ExportTemplateResult
                {
                    FileData = fileData,
                    FileName = fileName,
                    ContentType = contentType
                });
            }
            catch (Exception ex)
            {
                await _logger.LogExceptionAsync(ex, "Lỗi khi tạo mẫu sản phẩm");
                return Result<ExportTemplateResult>.BadRequest($"Tạo mẫu thất bại: {ex.Message}");
            }
        }
    }
}
