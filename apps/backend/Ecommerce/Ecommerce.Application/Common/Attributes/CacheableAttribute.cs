using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class CacheAttribute : Attribute
    {
        public string Prefix { get; }
        public ECachePolicy Policy { get; }
        public int? DurationMinutes { get; set; }
        public int? SlidingExpirationMinutes { get; set; }
        public string[] Tags { get; set; } = [];

        public CacheAttribute(string prefix, ECachePolicy policy = ECachePolicy.Short)
        {
            Prefix = prefix;
            Policy = policy;
        }
    }

    public sealed class CacheableAttribute : CacheAttribute
    {
        public CacheableAttribute(string prefix, ECachePolicy policy = ECachePolicy.Short)
            : base(prefix, policy)
        {
        }
    }
}
