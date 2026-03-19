using System.Linq.Expressions;

namespace Ecommerce.Domain.Interfaces.Base
{
    /// <summary>
    /// Interface tổng quát cho Repository dùng để thao tác với các entity.
    /// Áp dụng cho mô hình Repository Pattern.
    /// </summary>
    /// <typeparam name="T">Kiểu entity (class) cần thao tác.</typeparam>
    public interface IRepository<T> where T : class
    {
        /// <summary>
        /// Trả về một truy vấn IQueryable để có thể tiếp tục xử lý truy vấn (lọc, phân trang, include...).
        /// </summary>
        IQueryable<T> GetQueryable(bool tracking = false);

        /// <summary>
        /// Lấy một entity theo Id.
        /// </summary>
        /// <param name="id">Giá trị định danh của entity.</param>
        /// <param name="cancellationToken">Token để huỷ thao tác bất đồng bộ nếu cần.</param>
        Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);



        /// <summary>
        /// Lấy một entity theo Id và bao gồm cả các navigation property thông qua biểu thức include.
        /// </summary>
        /// <param name="id">Id của entity cần lấy.</param>
        /// <param name="include">Biểu thức để include các bảng liên quan.</param>
        /// <param name="cancellationToken">Token huỷ thao tác bất đồng bộ.</param>
        Task<T?> GetByIdWithIncludeAsync(
            Guid id,
            Expression<Func<IQueryable<T>, IQueryable<T>>>? include = null,
            CancellationToken cancellationToken = default);

        Task<T> GetByIdWithIncludeAsync(
            Guid id,
            bool splitQuery = false,
            params Expression<Func<T, object>>[] includes);
        /// <summary>
        /// Lấy toàn bộ danh sách entity.
        /// </summary>
        Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);

        Task<IEnumerable<T>> GetAllWithIncludeAsync(
           Expression<Func<IQueryable<T>, IQueryable<T>>>? include = null,
           CancellationToken cancellationToken = default);

        /// <summary>
        /// Thêm mới một entity vào hệ thống.
        /// </summary>
        Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);

        /// <summary>
        /// Cập nhật thông tin một entity.
        /// </summary>
        void Update(T entity);

        /// <summary>
        /// Xoá một entity khỏi hệ thống.
        /// </summary>
        void Delete(T entity);

        // -------- Các phương thức mở rộng --------

        /// <summary>
        /// Thêm nhiều entity cùng lúc.
        /// </summary>
        Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);

        /// <summary>
        /// Cập nhật nhiều entity cùng lúc.
        /// </summary>
        void UpdateRange(IEnumerable<T> entities);

        /// <summary>
        /// Xoá nhiều entity cùng lúc.
        /// </summary>
        void DeleteRange(IEnumerable<T> entities);

        /// <summary>
        /// Lưu các thay đổi đã thực hiện lên database.
        /// </summary>
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Kiểm tra xem có bất kỳ entity nào thoả mãn điều kiện không.
        /// </summary>
        Task<bool> AnyAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default);

        /// <summary>
        /// Đếm số lượng entity thoả mãn điều kiện.
        /// </summary>
        Task<int> CountAsync(Expression<Func<T, bool>>? expression = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tính tổng giá trị của một trường thoả mãn điều kiện.
        /// </summary>
        Task<decimal> SumAsync(Expression<Func<T, bool>>? expression = null, Expression<Func<T, decimal>>? selector = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Trả về entity đầu tiên thoả mãn điều kiện, hoặc null nếu không có.
        /// </summary>
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default);

        /// <summary>
        /// Trả về danh sách các entity thoả mãn điều kiện.
        /// </summary>
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> expression, CancellationToken cancellationToken = default);


        // Phân trang và lọc dữ liệu
        Task<PaginatedResult<T>> GetPaginatedAsync(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default,
            Func<IQueryable<T>, IQueryable<T>>? includeFunc = null);

        // Projection với phân trang
        Task<PaginatedResult<TResult>> GetPaginatedProjectionAsync<TResult>(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Expression<Func<T, TResult>>? selector = null,
            int pageIndex = 1,
            int pageSize = 10,
            CancellationToken cancellationToken = default);

        // Lấy dữ liệu với điều kiện
        Task<IEnumerable<T>> FilterAsync(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            CancellationToken cancellationToken = default);

        // Lấy dữ liệu với projection
        Task<IEnumerable<TResult>> GetProjectionAsync<TResult>(
            Expression<Func<T, bool>>? filter = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Expression<Func<T, TResult>>? selector = null,
            CancellationToken cancellationToken = default);


        // Thực thi stored procedure hoặc raw SQL
        Task<IEnumerable<TResult>> ExecuteQueryAsync<TResult>(string sql, object? parameters = null, CancellationToken cancellationToken = default);

        // Thực thi command
        Task<int> ExecuteCommandAsync(string sql, object? parameters = null, CancellationToken cancellationToken = default);
    }
}

