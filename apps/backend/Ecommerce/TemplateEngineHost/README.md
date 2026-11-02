Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Thư mục TemplateEngineHost

## 1. Bản chất kỹ thuật
Thư mục `TemplateEngineHost` là thư mục cache nội bộ được sinh tự động bởi Visual Studio Template Engine (`vs/templatecache.json`, `.vstemplates.*`) trong quá trình khởi tạo template dự án ASP.NET Core ban đầu (commit khởi tạo `e625f14c54cd` ngày 19/03/2026).

Thư mục này **hoàn toàn không chứa mã nguồn nghiệp vụ hay Razor email templates (`.cshtml`)** như một số tài liệu cũ phỏng đoán.

## 2. Cơ chế Email Template thực tế của hệ thống
Hệ thống ShopViet E-Commerce xử lý gửi email thông báo (đơn hàng, cập nhật trạng thái, đặt lại mật khẩu) thông qua:
- **Dịch vụ nền**: `Ecommerce.Infrastructure/Services/EmailBackgroundService.cs`
- **Mẫu email**: Các tệp HTML tĩnh đặt tại `Ecommerce.Infrastructure/EmailTemplates/*.html` (ví dụ: `order-confirmation.html`, `reset-password.html`, `order-status-update.html`).
- **Cơ chế thế biến**: Thay thế placeholder chuỗi trong template HTML, hoàn toàn độc lập và không sử dụng Razor Engine.
