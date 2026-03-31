
using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Ecommerce.Infrastructure.Services
{
    public class FileStorageService : IFileStorageService
    {
        private readonly string _rootPath;
        private readonly IWebHostEnvironment _env;
        private readonly FileStorageConfig _config;
        private readonly string _baseUrl;

        public FileStorageService(IWebHostEnvironment env, IOptions<FileStorageConfig> config)
        {
            _env = env;
            _config = config.Value;
            
            // Ensure WebRootPath exists or fallback to ContentRootPath
            var root = Path.Combine(_env.ContentRootPath, "wwwroot");

            // Create uploads directory if it doesn't exist
            // Sử dụng cấu hình hoặc mặc định là "uploads"
            var uploadFolder = string.IsNullOrWhiteSpace(_config.UploadFolder) ? "uploads" : _config.UploadFolder;
            _rootPath = Path.Combine(root, uploadFolder);
            
            Directory.CreateDirectory(_rootPath); // Ensure the uploads directory exists
            _baseUrl = _config.AppUrl?.TrimEnd('/') ?? "";
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            if (string.IsNullOrWhiteSpace(folderName))
            {
                folderName = "default";
            }

            var fileName = GetUniqueFileName(file.FileName);
            var folderPath = Path.Combine(_rootPath, folderName);
            var filePath = Path.Combine(folderPath, fileName);

            // Đảm bảo thư mục tồn tại
            Directory.CreateDirectory(folderPath);

            // Kiểm tra nếu là file hình ảnh
            if (IsImageFile(file))
            {
                // Tối ưu hóa hình ảnh trước khi lưu
                await OptimizeAndSaveImageAsync(file, filePath);
            }
            else
            {
                // Lưu file thông thường
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }

            // Trả về đường dẫn relative để lưu vào database
            var uploadFolder = string.IsNullOrWhiteSpace(_config.UploadFolder) ? "uploads" : _config.UploadFolder;
            return Path.Combine(uploadFolder, folderName, fileName).Replace('\\', '/');
        }

        public Task<bool> DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return Task.FromResult(false);

            var fullPath = Path.Combine(_env.WebRootPath, filePath.TrimStart('/'));

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }

        public async Task<string> GetFileUrlAsync(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
                return await Task.FromResult(string.Empty);

            // Đảm bảo đường dẫn tương đối bắt đầu với dấu gạch chéo
            if (!relativePath.StartsWith("/"))
                relativePath = "/" + relativePath;

            return await Task.FromResult($"{_baseUrl}{relativePath}");
        }

        private static string GetUniqueFileName(string fileName)
        {
            // Tạo tên file duy nhất bằng cách sử dụng timestamp và GUID
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            var guid = Guid.NewGuid().ToString("N").Substring(0, 6);
            var extension = Path.GetExtension(fileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName)
                .Replace(" ", "-")
                .ToLower();

            return $"{nameWithoutExtension}-{timestamp}-{guid}{extension}";
        }

        private static bool IsImageFile(IFormFile file)
        {
            // 1. Kiểm tra extension
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var allowedExts = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            if (!allowedExts.Contains(ext)) return false;

            // 2. Kiểm tra Content-Type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower())) return false;

            // 3. Kiểm tra magic bytes (file signature) để chống file giả mạo MIME type
            using var stream = file.OpenReadStream();
            var header = new byte[12];
            var bytesRead = stream.Read(header, 0, header.Length);
            if (bytesRead < 4) return false;

            // JPEG: FF D8 FF
            var isJpeg = header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
            // PNG: 89 50 4E 47 0D 0A 1A 0A
            var isPng = header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
            // GIF: 47 49 46 38 (GIF8)
            var isGif = header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x38;
            // WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50 (RIFF....WEBP)
            var isWebp = bytesRead >= 12
                && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;

            return isJpeg || isPng || isGif || isWebp;
        }

        private static async Task OptimizeAndSaveImageAsync(IFormFile file, string filePath)
        {
            using var image = await Image.LoadAsync(file.OpenReadStream());

            // Thiết lập kích thước tối đa
            int maxWidth = 1200;
            int maxHeight = 1200;

            // Resize nếu cần
            if (image.Width > maxWidth || image.Height > maxHeight)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxWidth, maxHeight)
                }));
            }

            // Giảm chất lượng để giảm kích thước file nhưng vẫn giữ chất lượng tốt
            var encoder = new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder
            {
                Quality = 80 // Điều chỉnh chất lượng (1-100)
            };

            await image.SaveAsJpegAsync(filePath, encoder);
        }
    }
}

