namespace Ecommerce.Domain.Interfaces.Logging
{
    public interface IPerformanceLogger
    {
        /// <summary>
        /// Ghi log hiệu năng của phương thức
        /// </summary>
        /// <param name="methodName">Tên phương thức</param>
        /// <param name="className">Tên lớp</param>
        /// <param name="executionTimeMs">Thời gian thực thi</param>
        /// <param name="userId">Người thực hiện</param>
        Task LogPerformanceAsync(
            string methodName,
            string className,
            long executionTimeMs,
            Guid? userId = null);
    }
}

