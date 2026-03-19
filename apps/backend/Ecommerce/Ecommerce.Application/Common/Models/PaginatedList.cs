namespace Ecommerce.Application.Common.Models
{
    public class PaginatedList<T>(List<T> items, int count, int pageNumber, int pageSize)
    {
        public List<T> Items { get; } = items ?? new List<T>();
        public int PageNumber { get; } = pageNumber > 0 ? pageNumber : 1;
        public int TotalPages { get; } = pageSize > 0 ? (int)Math.Ceiling(count / (double)pageSize) : 0;
        public int TotalCount { get; } = count;
        public int PageSize { get; } = pageSize > 0 ? pageSize : 10;

        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
        public bool IsFirstPage => PageNumber == 1;
        public bool IsLastPage => PageNumber >= TotalPages;

        // Helper method for empty paginated lists
        public static PaginatedList<T> Empty(int pageNumber = 1, int pageSize = 10) =>
            new([], 0, pageNumber, pageSize);
    }
}
