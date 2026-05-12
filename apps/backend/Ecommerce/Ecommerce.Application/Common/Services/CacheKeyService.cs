using Ecommerce.Application.Common.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ecommerce.Application.Common.Services
{
    public class CacheKeyService : ICacheKeyService
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public string BuildKey<TRequest>(TRequest request, string? prefix = null)
        {
            var requestType = typeof(TRequest);
            var keyPrefix = string.IsNullOrWhiteSpace(prefix)
                ? requestType.Name
                : prefix.Trim();

            var payload = JsonSerializer.Serialize(request, JsonOptions);
            var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();

            return $"query:{Normalize(keyPrefix)}:{hash}";
        }

        private static string Normalize(string value)
        {
            var builder = new StringBuilder(value.Length);

            foreach (var c in value.Trim())
            {
                builder.Append(char.IsLetterOrDigit(c) ? char.ToLowerInvariant(c) : ':');
            }

            return builder.ToString().Trim(':');
        }
    }
}
