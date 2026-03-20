using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Features.Reports.Dto
{
    public class TopUserDto
    {
        public Guid UserId { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
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
        public required string Segment { get; set; }
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }
}

