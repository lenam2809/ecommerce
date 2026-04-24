using Ecommerce.Application.Common.Logging;

namespace Ecommerce.Application.Tests.Logging
{
    public class LogSanitizerTests
    {
        private readonly LogSanitizer _sanitizer = new();

        [Theory]
        [InlineData("email me at user@example.com", "[REDACTED_EMAIL]")]
        [InlineData("call 0912345678 now", "[REDACTED_PHONE]")]
        [InlineData("card 4111 1111 1111 1111", "[REDACTED_CARD]")]
        [InlineData("Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.xyz", "[REDACTED_TOKEN]")]
        [InlineData("password=super-secret", "[REDACTED_PASSWORD]")]
        public void Sanitize_MasksSensitiveContent(string input, string expectedToken)
        {
            var result = _sanitizer.Sanitize(input);

            Assert.Contains(expectedToken, result);
        }

        [Theory]
        [InlineData("Email", "user@example.com", "[REDACTED_EMAIL]")]
        [InlineData("PhoneNumber", "0912345678", "[REDACTED_PHONE]")]
        [InlineData("Password", "super-secret", "[REDACTED_PASSWORD]")]
        [InlineData("AccessToken", "abc123", "[REDACTED_TOKEN]")]
        public void SanitizePropertyValue_MasksSensitiveKeys(string propertyName, string value, string expected)
        {
            var result = _sanitizer.SanitizePropertyValue(propertyName, value);

            Assert.Equal(expected, result);
        }

        [Fact]
        public void SanitizePropertyValue_PreservesQueryableScalarValues()
        {
            var orderId = Guid.NewGuid();

            var result = _sanitizer.SanitizePropertyValue("OrderId", orderId);

            Assert.Equal(orderId, result);
        }
    }
}
