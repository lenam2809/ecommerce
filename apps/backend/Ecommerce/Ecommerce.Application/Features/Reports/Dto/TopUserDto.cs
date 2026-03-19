using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Reports.Dto
{
    public class TopUserDto
    {
        public Guid UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public decimal TotalSpent { get; set; }
        public int OrderCount { get; set; }
        public DateTime LastActivity { get; set; }
        public ECustomerLevel CustomerLevel { get; set; }
    }

    public class UserActivityDto
    {
        public DateTime Date { get; set; }
        public int Logins { get; set; }
        public int Purchases { get; set; }
        public int PageViews { get; set; }
    }

    public class UserSegmentationDto
    {
        public string Segment { get; set; }
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }
}

