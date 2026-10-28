using Ecommerce.Application.Common.Interfaces;
using Ecommerce.Application.Common.Models;
using Ecommerce.Application.Features.Orders.Dto;
using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Features.Orders.Commands.UploadOrderInvoicePdf
{
    public class UploadOrderInvoicePdfCommand : ICommand<Result<OrderInvoiceDto>>
    {
        public Guid OrderId { get; set; }
        public IFormFile? File { get; set; }
        public string? TaxCode { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? InvoiceEmail { get; set; }
    }
}
