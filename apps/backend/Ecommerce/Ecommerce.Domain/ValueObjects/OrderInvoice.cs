namespace Ecommerce.Domain.ValueObjects
{
    public class OrderInvoice
    {
        public bool RequireInvoice { get; set; } = false;
        public string? TaxCode { get; set; }
        public string? CompanyName { get; set; }
        public string? CompanyAddress { get; set; }
        public string? InvoiceEmail { get; set; }
        public string? InvoiceFileUrl { get; set; }

        public OrderInvoice()
        {
        }

        public OrderInvoice(
            bool requireInvoice,
            string? taxCode,
            string? companyName,
            string? companyAddress,
            string? invoiceEmail,
            string? invoiceFileUrl = null)
        {
            RequireInvoice = requireInvoice;
            TaxCode = taxCode;
            CompanyName = companyName;
            CompanyAddress = companyAddress;
            InvoiceEmail = invoiceEmail;
            InvoiceFileUrl = invoiceFileUrl;
        }
    }
}
