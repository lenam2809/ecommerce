namespace Ecommerce.Application.Common.Exceptions
{
    public class ForbiddenAccessException : ApplicationException
    {
        public ForbiddenAccessException() : base("Bạn không có quyền truy cập tài nguyên này.")
        {
        }
    }
}

