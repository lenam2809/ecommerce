namespace Ecommerce.Domain.Interfaces.Logging
{
    public interface ILogSanitizer
    {
        string Sanitize(string? input);

        object? SanitizePropertyValue(string propertyName, object? value);
    }
}
