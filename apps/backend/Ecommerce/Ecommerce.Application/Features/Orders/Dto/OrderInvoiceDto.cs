using AutoMapper;
using Ecommerce.Application.Common.Mappings;
using Ecommerce.Domain.ValueObjects;

namespace Ecommerce.Application.Features.Orders.Dto
{
    public class OrderInvoiceDto : IMapFrom<OrderInvoice>
    {
        public bool RequireInvoice { get; set; } = false;
        public string? TaxCode { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? InvoiceEmail { get; set; }
        public string? InvoiceFileUrl { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<OrderInvoice, OrderInvoiceDto>().ReverseMap();
        }
    }
}
