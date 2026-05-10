namespace Ecommerce.Application.Common.Exceptions
{
    public class SearchServiceUnavailableException : Exception
    {
        public SearchServiceUnavailableException(string message)
            : base(message)
        {
        }

        public SearchServiceUnavailableException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
