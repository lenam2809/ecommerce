namespace Ecommerce.Domain.Exceptions
{
    /// <summary>
    /// Base exception class for domain-specific business rule violations
    /// </summary>
    public class DomainException : Exception
    {
        public DomainException(string message) : base(message) { }
        
        public DomainException(string message, Exception innerException) 
            : base(message, innerException) { }
    }
}
