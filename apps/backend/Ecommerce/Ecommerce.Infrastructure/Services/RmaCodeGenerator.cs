using System.Security.Cryptography;
using Ecommerce.Application.Common.Interfaces;

namespace Ecommerce.Infrastructure.Services;

public sealed class RmaCodeGenerator : IRmaCodeGenerator
{
    public string Generate()
    {
        return $"RMA-{DateTime.UtcNow:yyyyMMddHHmmss}-{Convert.ToHexString(RandomNumberGenerator.GetBytes(4))}";
    }
}
