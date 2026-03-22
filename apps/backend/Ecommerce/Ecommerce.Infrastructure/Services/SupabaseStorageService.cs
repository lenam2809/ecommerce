using Ecommerce.Application.Common.Configs;
using Ecommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;
using Supabase;

namespace Ecommerce.Infrastructure.Services
{
    public class SupabaseStorageService : IFileStorageService
    {
        private readonly Client _supabase;
        private readonly SupabaseStorageConfig _config;

        public SupabaseStorageService(IOptions<SupabaseStorageConfig> config)
        {
            _config = config.Value;

            var options = new SupabaseOptions { AutoConnectRealtime = false };
            _supabase = new Client(_config.Url, _config.ServiceRoleKey, options);
            _supabase.InitializeAsync().GetAwaiter().GetResult();
        }

        // ─────────────────────────────────────────────
        //  SAVE
        // ─────────────────────────────────────────────
        public async Task<string> SaveFileAsync(IFormFile file, string folderName)
        {
            if (file == null || file.Length == 0) return string.Empty;

            if (string.IsNullOrWhiteSpace(folderName)) folderName = "default";

            var fileName   = GetUniqueFileName(file.FileName);
            var objectPath = $"{folderName}/{fileName}";

            byte[] fileBytes;
            string mimeType;

            if (IsImageFile(file))
            {
                fileBytes  = await OptimizeImageAsync(file);
                mimeType   = "image/jpeg";
                // Đổi extension sang .jpg sau khi optimize
                var ext = Path.GetExtension(objectPath).ToLower();
                if (ext != ".jpg" && ext != ".jpeg")
                    objectPath = Path.ChangeExtension(objectPath, ".jpg");
            }
            else
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
                mimeType  = file.ContentType;
            }

            var storage = _supabase.Storage.From(_config.BucketName);
            await storage.Upload(fileBytes, objectPath,
                new Supabase.Storage.FileOptions { ContentType = mimeType, Upsert = false });

            // Trả về objectPath – lưu vào database
            return objectPath;
        }

        // ─────────────────────────────────────────────
        //  DELETE
        // ─────────────────────────────────────────────
        public async Task<bool> DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath)) return false;

            try
            {
                var storage = _supabase.Storage.From(_config.BucketName);
                await storage.Remove(new List<string> { filePath.TrimStart('/') });
                return true;
            }
            catch
            {
                return false;
            }
        }

        // ─────────────────────────────────────────────
        //  GET URL
        // ─────────────────────────────────────────────
        public Task<string> GetFileUrlAsync(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
                return Task.FromResult(string.Empty);

            var storage   = _supabase.Storage.From(_config.BucketName);
            var publicUrl = storage.GetPublicUrl(relativePath.TrimStart('/'));
            return Task.FromResult(publicUrl);
        }

        // ─────────────────────────────────────────────
        //  HELPERS
        // ─────────────────────────────────────────────
        private static string GetUniqueFileName(string fileName)
        {
            var ts   = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
            var guid = Guid.NewGuid().ToString("N")[..6];
            var ext  = Path.GetExtension(fileName);
            var name = Path.GetFileNameWithoutExtension(fileName)
                           .Replace(" ", "-").ToLower();
            return $"{name}-{ts}-{guid}{ext}";
        }

        private static bool IsImageFile(IFormFile file)
        {
            var allowed = new[] { "image/jpeg", "image/jpg", "image/png",
                                  "image/gif",  "image/webp" };
            return allowed.Contains(file.ContentType.ToLower());
        }

        private static async Task<byte[]> OptimizeImageAsync(IFormFile file)
        {
            using var image = await Image.LoadAsync(file.OpenReadStream());

            const int maxW = 1200, maxH = 1200;
            if (image.Width > maxW || image.Height > maxH)
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxW, maxH)
                }));

            using var ms      = new MemoryStream();
            var       encoder = new JpegEncoder { Quality = 80 };
            await image.SaveAsJpegAsync(ms, encoder);
            return ms.ToArray();
        }
    }
}
