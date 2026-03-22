using Ecommerce.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Ecommerce.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestStorageController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public TestStorageController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        /// <summary>
        /// Test upload ảnh lên Supabase Storage
        /// </summary>
        /// <param name="file">File ảnh cần upload</param>
        /// <param name="folder">Thư mục lưu trữ (mặc định: test-uploads)</param>
        /// <returns>Thông tin path và URL của ảnh</returns>
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "test-uploads")
        {
            if (file == null || file.Length == 0)
                return BadRequest("Vui lòng chọn file để upload.");

            try
            {
                // 1. Lưu file lên Supabase
                var relativePath = await _fileStorageService.SaveFileAsync(file, folder);

                // 2. Lấy URL public để hiển thị
                var publicUrl = await _fileStorageService.GetFileUrlAsync(relativePath);

                return Ok(new
                {
                    Message = "Upload thành công!",
                    RelativePath = relativePath,
                    PublicUrl = publicUrl,
                    FileName = file.FileName,
                    Size = file.Length
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi khi upload: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy public URL từ một relative path đã có trong DB
        /// </summary>
        [HttpGet("url")]
        public async Task<IActionResult> GetUrl([FromQuery] string path)
        {
            if (string.IsNullOrEmpty(path))
                return BadRequest("Vui lòng cung cấp path.");

            var url = await _fileStorageService.GetFileUrlAsync(path);
            return Ok(new { Path = path, PublicUrl = url });
        }
        
        /// <summary>
        /// Xóa file trên Supabase
        /// </summary>
        [HttpDelete("delete")]
        public async Task<IActionResult> Delete([FromQuery] string path)
        {
            if (string.IsNullOrEmpty(path))
                return BadRequest("Vui lòng cung cấp path.");

            var result = await _fileStorageService.DeleteFileAsync(path);
            if (result)
                return Ok(new { Message = "Xóa thành công!" });
            
            return BadRequest("Không thể xóa file hoặc file không tồn tại.");
        }
    }
}
