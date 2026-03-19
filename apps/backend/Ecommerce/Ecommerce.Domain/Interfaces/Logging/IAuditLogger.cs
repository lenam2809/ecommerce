namespace Ecommerce.Domain.Interfaces.Logging
{
    public interface IAuditLogger
    {
        /// <summary>
        /// Ghi log kiểm toán cho các thay đổi trên entity
        /// </summary>
        /// <param name="entityName">Tên đối tượng được thay đổi</param>
        /// <param name="actionType">Loại hành động (Create, Update, Delete)</param>
        /// <param name="oldValues">Giá trị cũ của đối tượng</param>
        /// <param name="newValues">Giá trị mới của đối tượng</param>
        /// <param name="userId">Người thực hiện thay đổi</param>
        Task LogAuditAsync(
            string entityName,
            string actionType,
            string oldValues,
            string newValues,
            Guid? userId = null);
    }
}

