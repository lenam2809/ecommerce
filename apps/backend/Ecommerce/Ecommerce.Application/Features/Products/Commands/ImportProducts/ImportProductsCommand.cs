using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Products.Dto;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Products.Commands.ImportProducts
{
    public class ImportProductsCommand : IRequest<Result<ImportProductsResult>>
    {
        public IFormFile File { get; set; }
        public bool ValidateOnly { get; set; } = false;
    }

    public class ImportProductsResult
    {
        public int TotalItems { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public int AddedCount { get; set; }
        public int UpdatedCount { get; set; }
        public int DeletedCount { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<ProductImportExportDto> ErrorItems { get; set; } = new List<ProductImportExportDto>();
    }
}

