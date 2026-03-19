namespace Ecommerce.Application.Common.Exceptions
{
    public class NotFoundException : ApplicationException
    {
        public NotFoundException(string name, object key) : base($"Không tìm thấy thực thể \"{name}\" ({key}).")
        {
        }
    }
}

