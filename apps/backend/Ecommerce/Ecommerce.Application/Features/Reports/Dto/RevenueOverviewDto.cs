namespace Ecommerce.Application.Features.Reports.Dto
{
    public class RevenueOverviewDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public decimal ThisWeekRevenue { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal MonthGrowthPercentage { get; set; }
        public decimal WeekGrowthPercentage { get; set; }
        public decimal DayGrowthPercentage { get; set; }
    }
}

