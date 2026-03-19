namespace Ecommerce.Application.Common.Configs
{
    public class CacheConfig
    {
        public bool UseRedis { get; set; }
        public int DefaultExpirationMinutes { get; set; } = 60;
        public required string RedisConnection { get; set; }
        public string InstanceName { get; set; } = "Ecommerce_";
    }
}

