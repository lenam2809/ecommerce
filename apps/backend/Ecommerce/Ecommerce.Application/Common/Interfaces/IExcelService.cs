namespace Ecommerce.Application.Common.Interfaces
{
    public interface IExcelService
    {
        Task<List<T>> ReadExcelAsync<T>(Stream fileStream) where T : class, new();
        Task<byte[]> ExportToExcelAsync<T>(List<T> data, string sheetName = "Sheet1");
        Task<List<T>> ReadCsvAsync<T>(Stream fileStream) where T : class, new();
        Task<byte[]> ExportToCsvAsync<T>(List<T> data);
    }
}

