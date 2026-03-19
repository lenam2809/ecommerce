using Ecommerce.Domain.Enums;

namespace Ecommerce.Application.Common.Attributes
{
    [AttributeUsage(AttributeTargets.Class)]
    public class CacheableAttribute : Attribute
    {
        public string Prefix { get; }
        public ECachePolicy Policy { get; }

        public CacheableAttribute(string prefix, ECachePolicy policy = ECachePolicy.Short)
        {
            Prefix = prefix;
            Policy = policy;
        }
    }

}

