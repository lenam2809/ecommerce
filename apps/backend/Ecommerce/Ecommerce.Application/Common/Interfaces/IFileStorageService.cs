using Microsoft.AspNetCore.Http;

namespace Ecommerce.Application.Common.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> SaveFileAsync(IFormFile file, string folderName, string? customSlug = null);
        Task<bool> DeleteFileAsync(string filePath);
        Task<string> GetFileUrlAsync(string relativePath);
    }
}

