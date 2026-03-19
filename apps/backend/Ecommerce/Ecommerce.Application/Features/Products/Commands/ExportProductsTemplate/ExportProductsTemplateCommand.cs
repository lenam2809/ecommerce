using Ecommerce.Application.Common.Models;
using MediatR;

namespace Ecommerce.Application.Features.Products.Commands.ExportProductsTemplate
{
    public class ExportProductsTemplateCommand : IRequest<Result<ExportTemplateResult>>
    {
        public string Format { get; set; } = "xlsx"; // xlsx, xls, csv
    }

    public class ExportTemplateResult
    {
        public byte[] FileData { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
    }
}
