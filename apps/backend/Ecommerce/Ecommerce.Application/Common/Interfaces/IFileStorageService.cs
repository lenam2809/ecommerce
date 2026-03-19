using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName);
        Task<bool> DeleteFileAsync(string filePath);
        Task<string> GetFileUrlAsync(string relativePath);
    }
}

