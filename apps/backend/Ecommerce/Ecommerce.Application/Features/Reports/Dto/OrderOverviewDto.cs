namespace Ecommerce.Application.Features.Reports.Dto
{
    public class OrderOverviewDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CanceledOrders { get; set; }
        public double TotalGrowthPercentage { get; set; }
        public double CompletedGrowthPercentage { get; set; }
        public double PendingGrowthPercentage { get; set; }
        public double CanceledGrowthPercentage { get; set; }
    }
}

