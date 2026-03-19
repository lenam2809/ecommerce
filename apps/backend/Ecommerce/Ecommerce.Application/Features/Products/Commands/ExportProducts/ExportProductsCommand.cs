using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.ExportProducts
{
    public class ExportProductsCommand : IRequest<Result<ExportProductsResult>>
    {
        public string Format { get; set; } = "xlsx"; // xlsx, xls, csv
        public List<Guid> ProductIds { get; set; } = new List<Guid>(); // Optional - if empty, export all
        public bool IncludeInactive { get; set; } = false;
    }

    public class ExportProductsResult
    {
        public byte[] FileData { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public int RecordCount { get; set; }
    }
}

