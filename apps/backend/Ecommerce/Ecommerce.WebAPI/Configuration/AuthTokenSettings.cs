using System.ComponentModel.DataAnnotations;

namespace Ecommerce.WebAPI.Configuration
{
    /// <summary>
    /// 🔒 SECURITY (H5): settings bắt buộc cho section "Auth" trong cấu hình.
    /// TokenHashSecret được dùng bởi TokenService.HashToken (HMAC-SHA256) để hash
    /// refresh token trước khi lưu DB — nếu thiếu hoặc quá ngắn, login sẽ vỡ
    /// (TokenService.cs throw InvalidOperationException) hoặc hash dễ bị tấn công.
    /// ValidateOnStart giúp app crash NGAY LÚC BOOT thay vì chết khi user đầu tiên đăng nhập.
    /// </summary>
    public class AuthTokenSettings
    {
        [Required(ErrorMessage = "Auth:TokenHashSecret là bắt buộc — cấu hình biến môi trường Auth__TokenHashSecret.")]
        [MinLength(16, ErrorMessage = "Auth:TokenHashSecret phải dài ít nhất 16 ký tự (khuyến nghị ≥ 32).")]
        public string TokenHashSecret { get; set; } = string.Empty;
    }
}
