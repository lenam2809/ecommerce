using System.Security.Cryptography;
using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Infrastructure.Services;

public sealed class OrderCodeGenerator : IOrderCodeGenerator
{
    public string Generate()
    {
        return $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
    }
}
