namespace Ecommerce.Application.Common.Configs
{
    public class CacheConfig
    {
        public bool UseRedis { get; set; } = true;
        public int DefaultExpirationMinutes { get; set; } = 10;
        public int DefaultSlidingExpirationMinutes { get; set; } = 2;
        public int ProductExpirationMinutes { get; set; } = 10;
        public int CategoryExpirationMinutes { get; set; } = 30;
        public int BrandExpirationMinutes { get; set; } = 30;
        public int ConfigExpirationMinutes { get; set; } = 60;
        public int UserSpecificExpirationMinutes { get; set; } = 2;
        public int GuestCartExpirationDays { get; set; } = 7;
        public string RedisConnection { get; set; } = "localhost:6379";
        public string InstanceName { get; set; } = "ecommerce:";
    }
}
