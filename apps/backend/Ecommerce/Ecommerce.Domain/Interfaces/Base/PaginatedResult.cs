namespace Ecommerce.Domain.Interfaces.Base
{
    public class PaginatedResult<T>
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public IEnumerable<T> Items { get; set; } = new List<T>();
    }
}

