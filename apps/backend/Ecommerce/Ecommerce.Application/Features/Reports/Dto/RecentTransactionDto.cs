namespace Ecommerce.Application.Features.Reports.Dto
{
    public class RecentTransactionDto
    {
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public decimal Amount { get; set; }
        public string OrderDate { get; set; }
    }
}

