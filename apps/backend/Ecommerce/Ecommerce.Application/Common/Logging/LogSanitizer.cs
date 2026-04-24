using Ecommerce.Domain.Interfaces.Logging;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Ecommerce.Application.Common.Logging
{
    public class LogSanitizer : ILogSanitizer
    {
        private static readonly Regex BearerTokenRegex = new(
            @"(?i)\bBearer\s+[A-Za-z0-9\-\._~\+\/=]+\b",
            RegexOptions.Compiled);

        private static readonly Regex JwtRegex = new(
            @"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b",
            RegexOptions.Compiled);

        private static readonly Regex PasswordRegex = new(
            @"(?i)([""']?(?:password|pwd|pass)[""']?\s*[:=]\s*)([""']?)([^,"";}\]\s]+)([""']?)",
            RegexOptions.Compiled);

        private static readonly Regex EmailRegex = new(
            @"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex VietnamPhoneRegex = new(
            @"(?<!\d)(?:\+?84|0)(?:[\s\-.]?(?:3|5|7|8|9))(?:[\s\-.]?\d){8}(?!\d)",
            RegexOptions.Compiled);

        private static readonly Regex CreditCardRegex = new(
            @"\b(?:\d[ -]*?){13,19}\b",
            RegexOptions.Compiled);

        public string Sanitize(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return input ?? string.Empty;
            }

            var sanitized = input;
            sanitized = BearerTokenRegex.Replace(sanitized, "Bearer [REDACTED_TOKEN]");
            sanitized = JwtRegex.Replace(sanitized, "[REDACTED_JWT]");
            sanitized = PasswordRegex.Replace(sanitized, "$1$2[REDACTED_PASSWORD]$4");
            sanitized = EmailRegex.Replace(sanitized, "[REDACTED_EMAIL]");
            sanitized = VietnamPhoneRegex.Replace(sanitized, "[REDACTED_PHONE]");
            sanitized = CreditCardRegex.Replace(
                sanitized,
                match => IsLikelyCreditCard(match.Value) ? "[REDACTED_CARD]" : match.Value);

            return sanitized;
        }

        public object? SanitizePropertyValue(string propertyName, object? value)
        {
            if (value == null)
            {
                return null;
            }

            if (TryGetSensitiveMask(propertyName, out var mask))
            {
                return mask;
            }

            return value switch
            {
                string stringValue => Sanitize(stringValue),
                Guid => value,
                bool => value,
                byte => value,
                short => value,
                int => value,
                long => value,
                float => value,
                double => value,
                decimal => value,
                DateTime => value,
                DateTimeOffset => value,
                TimeSpan => value,
                Enum => value,
                _ => Sanitize(Convert.ToString(value, CultureInfo.InvariantCulture))
            };
        }

        private static bool TryGetSensitiveMask(string propertyName, out string mask)
        {
            var normalized = propertyName.Trim().ToLowerInvariant();

            if (normalized.Contains("password") || normalized.Contains("pwd") || normalized.Contains("pass"))
            {
                mask = "[REDACTED_PASSWORD]";
                return true;
            }

            if (normalized.Contains("token") || normalized.Contains("jwt") || normalized.Contains("authorization") || normalized.Contains("secret"))
            {
                mask = "[REDACTED_TOKEN]";
                return true;
            }

            if (normalized.Contains("email"))
            {
                mask = "[REDACTED_EMAIL]";
                return true;
            }

            if (normalized.Contains("phone") || normalized.Contains("mobile"))
            {
                mask = "[REDACTED_PHONE]";
                return true;
            }

            if (normalized.Contains("card"))
            {
                mask = "[REDACTED_CARD]";
                return true;
            }

            mask = string.Empty;
            return false;
        }

        private static bool IsLikelyCreditCard(string rawValue)
        {
            var digits = new string(rawValue.Where(char.IsDigit).ToArray());
            if (digits.Length < 13 || digits.Length > 19)
            {
                return false;
            }

            var sum = 0;
            var alternate = false;
            for (var i = digits.Length - 1; i >= 0; i--)
            {
                var n = digits[i] - '0';
                if (alternate)
                {
                    n *= 2;
                    if (n > 9)
                    {
                        n -= 9;
                    }
                }

                sum += n;
                alternate = !alternate;
            }

            return sum % 10 == 0;
        }
    }
}
