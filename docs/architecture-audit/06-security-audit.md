> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](../architecture-backend.md).

# 06 — Kiểm toán An ninh & Lỗ hổng Bảo mật (Security Audit)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phương pháp:** Threat Modeling, Static Code Analysis, OWASP Top 10 đối chiếu và kiểm tra chéo cấu hình triển khai.  
> **Chính sách an toàn:** Tuyệt đối không hiển thị giá trị secret, token, mật khẩu thật trong báo cáo (đã được làm mờ/redacted).

---

## 1. Mô hình Đe dọa (Threat Model)

Hệ thống ShopViet có 4 bề mặt tấn công chính (Attack Surfaces):
1. **Public Storefront API (Khách hàng & Khách vãng lai)**: Các endpoint xem hàng, đăng ký, đăng nhập, giỏ hàng guest, đặt hàng và callback thanh toán.
2. **Admin Backoffice API (Nhân viên & Quản trị viên)**: Các endpoint quản lý sản phẩm, đơn hàng, người dùng, vai trò, cấu hình marquee, xem logs hệ thống.
3. **Webhooks & External Integrations**: VNPay IPN webhook, Supabase Storage API, Elasticsearch cluster.
4. **Configuration & Secrets Pipeline**: Các file cấu hình `appsettings.*.json`, `render.yaml`, `docker-compose/.env`.

---

## 2. Bảng Tổng hợp Phát hiện An ninh (Findings Register)

| ID | Nhóm lỗ hổng | Mức độ | Độ tin cậy | File & Vị trí liên quan | Tóm tắt lỗ hổng | Trạng thái |
|---|---|---|---|---|---|---|
| **SEC-01** | Security Misconfiguration | 🔴 **Critical** | Confirmed | `appsettings.Development.json:14, 27` | Lộ Live Database Password & Supabase `ServiceRoleKey` trong file cấu hình local | Đang tồn tại |
| **SEC-02** | Security Misconfiguration | 🟠 **High** | Confirmed | `Program.cs:247` | Tự động Seed dữ liệu mẫu không điều kiện trên mọi môi trường (`SeedAsync(services, true)`) | Đang tồn tại |
| **SEC-03** | Broken Access Control | 🟠 **High** | Confirmed | `UserActivitiesController.cs:12, 28, 40` | Thiếu `[Authorize]` trên `UserActivitiesController`, mở public API lịch sử người dùng | Đang tồn tại |
| **SEC-04** | Broken Access Control | 🟡 **Medium** | Confirmed | `ProductsController.cs:201` | Endpoint `[HttpGet("export-template")]` bị comment `//[Authorize]` | Đang tồn tại |
| **SEC-05** | CSRF Vulnerability | 🟡 **Medium** | Confirmed | `CsrfValidationMiddleware.cs:40` | Bypass kiểm tra CSRF trên `/auth/refresh-token` khi cookie `access_token` đã hết hạn | Đang tồn tại |
| **SEC-06** | Null Dereference / Crash | 🟡 **Medium** | Confirmed | `AccountLockMiddleware.cs:23` | Thiếu null-conditional `?.` trên `context.User.Identity.IsAuthenticated` gây crash request unauthenticated | Đang tồn tại |
| **SEC-07** | Configuration / Availability | 🟡 **Medium** | Confirmed | `appsettings.Production.json:23`, `TokenService.cs:77-81` | `Auth:TokenHashSecret` rỗng trong cấu hình production mẫu gây fail-fast crash khi không có env var | Đang tồn tại |
| **SEC-08** | Sensitive Data Exposure | 🟢 **Low** | Confirmed | `appsettings.json:30-31` | Thông tin VNPay Sandbox credentials (`TmnCode`, `HashSecret`) lưu cứng trong source control | Đang tồn tại |
| **SEC-09** | CORS Misconfiguration | 🟢 **Low** | Confirmed | `docker-compose/docker-compose.yml:135-136` | CORS cho phép HTTP origins song song với HTTPS trong production | Đang tồn tại |
| **SEC-10** | Missing Validation | 🟢 **Low** | Confirmed | `CreateReturnRequestCommandValidator` | Thiếu validation kích thước/định dạng ảnh bằng chứng đổi trả | Đang tồn tại |

---

## 3. Phân tích Chi tiết Từng Phát hiện An ninh

### 🔴 SEC-01: Lộ Live Supabase Database Password & ServiceRoleKey trong File Cấu hình
- **Phân loại:** OWASP A05:2021 — Security Misconfiguration / Cryptographic Failures.
- **Mức độ:** **Critical** | **Độ tin cậy:** Confirmed (Bằng chứng trực tiếp).
- **Vị trí:** [appsettings.Development.json](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.json#L13-L28):
  - Dòng 13–15: Khóa bí mật quản trị cao nhất `SupabaseStorage:ServiceRoleKey` (cho phép bypass hoàn toàn Row Level Security của Supabase) được ghi rõ ràng dưới dạng JWT token.
  - Dòng 27: Chuỗi kết nối `ConnectionStrings:DefaultConnection` chứa thông tin tài khoản Supabase pooler AWS (`aws-1-ap-southeast-1.pooler.supabase.com`), kèm username và mật khẩu quản trị thật.
- **Tác động:** Kẻ tấn công hoặc bất kỳ ai có quyền truy cập vào máy trạm hoặc bản sao lưu có thể kết nối trực tiếp vào cơ sở dữ liệu Supabase, đọc, sửa đổi hoặc xóa toàn bộ dữ liệu người dùng, đơn hàng và hình ảnh.
- **Khuyến nghị khắc phục:**
  1. Lập tức đổi mật khẩu cơ sở dữ liệu Supabase và thu hồi `ServiceRoleKey` hiện tại trên Supabase Dashboard.
  2. Xóa các chuỗi nhạy cảm khỏi `appsettings.Development.json`, thay bằng placeholder `CHANGE_ME`.
  3. Sử dụng .NET User Secrets (`dotnet user-secrets set ...`) cho môi trường dev cá nhân.

---

### 🟠 SEC-02: Tự động Seed Dữ liệu Mẫu Không Điều Kiện trên Mọi Môi trường
- **Phân loại:** OWASP A05:2021 — Security Misconfiguration.
- **Mức độ:** **High** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [Program.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs#L245-L247):
  ```csharp
  // Always apply migrations
  await context.Database.MigrateAsync();
  //await ApplicationDbContextSeed.SeedAsync(services, app.Environment.IsDevelopment());
  await ApplicationDbContextSeed.SeedAsync(services, true);
  ```
- **Cơ chế:** Dòng 246 (kiểm tra `app.Environment.IsDevelopment()`) đã bị comment lại và thay bằng dòng 247 truyền cứng giá trị `true`.
- **Tác động:** Mỗi khi backend khởi động trong môi trường Staging hoặc Production (ví dụ deploy trên Render hoặc khởi động Docker Compose), hệ thống sẽ tự động chèn hàng chục danh mục, sản phẩm, đánh giá và tài khoản admin/customer mặc định (`admin@Ecommerce.com`, `Admin@123456`) vào database thật!
- **Khuyến nghị khắc phục:**
  - Bật lại kiểm tra môi trường:
    ```csharp
    await ApplicationDbContextSeed.SeedAsync(services, app.Environment.IsDevelopment());
    ```

---

### 🟠 SEC-03: `UserActivitiesController` Mở Public Không Có `[Authorize]`
- **Phân loại:** OWASP A01:2021 — Broken Access Control.
- **Mức độ:** **High** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [UserActivitiesController.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/UserActivitiesController.cs#L12-L41):
  ```csharp
  [Route("api/[controller]")]
  [ApiController]
  //[Authorize]
  public class UserActivitiesController : ControllerBase
  ```
- **Cơ chế:** Dòng 12 `//[Authorize]` bị comment. Hai endpoint:
  - `GET /api/UserActivities`
  - `GET /api/UserActivities/recent`
  hoàn toàn không có attribute bảo vệ quyền truy cập.
- **Tác động:** Mặc dù bên trong `GetUserActivitiesQueryHandler.cs` có kiểm tra logic nếu `targetUserId != currentUserId`, việc không có guard ở controller cho phép caller nặc danh thăm dò API, tiêu tốn tài nguyên server và có nguy cơ rò rỉ hoạt động người dùng nếu logic handler bị lỗi.
- **Khuyến nghị khắc phục:** Bỏ comment `[Authorize]` ở cấp class của `UserActivitiesController`.

---

### 🟡 SEC-04: `ProductsController.ExportTemplate` Thiếu Guard Phân quyền
- **Phân loại:** OWASP A01:2021 — Broken Access Control.
- **Mức độ:** **Medium** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [ProductsController.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ProductsController.cs#L200-L202):
  ```csharp
  [HttpGet("export-template")]
  //[Authorize(Policy = EPermissions.EditProduct)]
  public async Task<IActionResult> ExportTemplate([FromQuery] ExportProductsTemplateCommand command)
  ```
- **Tác động:** Bất kỳ ai không cần đăng nhập cũng có thể tải về file mẫu nhập liệu sản phẩm nội bộ của doanh nghiệp.
- **Khuyến nghị:** Mở lại `[Authorize(Policy = EPermissions.EditProduct)]`.

---

### 🟡 SEC-05: CSRF Token Bị Bỏ qua Khi Cookie `access_token` Đã Hết Hạn
- **Phân loại:** OWASP A01:2021 — Broken Access Control / CSRF.
- **Mức độ:** **Medium** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [CsrfValidationMiddleware.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Middleware/CsrfValidationMiddleware.cs#L40-L44):
  ```csharp
  // Skip if no auth cookie present (public endpoints)
  if (!context.Request.Cookies.ContainsKey("access_token"))
  {
      await _next(context);
      return;
  }
  ```
- **Cơ chế:** Khi người dùng mở website sau 15–60 phút, cookie `access_token` đã hết hạn và bị browser xóa, nhưng cookie `refresh_token` (sống 7 ngày) vẫn còn. Khi client tự động gọi `POST /api/auth/refresh-token`, điều kiện `!ContainsKey("access_token")` trả về `true` -> middleware **bỏ qua hoàn toàn việc kiểm tra CSRF**, cho phép trang web độc hại thực hiện Cross-Site Request Forgery để kích hoạt refresh token và lấy access token mới!
- **Khuyến nghị:**
  ```csharp
  var hasAuthCookie = context.Request.Cookies.ContainsKey("access_token") ||
                      context.Request.Cookies.ContainsKey("refresh_token");
  if (!hasAuthCookie)
  {
      await _next(context);
      return;
  }
  ```

---

### 🟡 SEC-06: Nguy cơ Crash Unhandled Exception trong `AccountLockMiddleware`
- **Phân loại:** OWASP A05:2021 — Security Misconfiguration / Availability.
- **Mức độ:** **Medium** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [AccountLockMiddleware.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Middleware/AccountLockMiddleware.cs#L23):
  ```csharp
  if (context.User.Identity.IsAuthenticated && !path.EndsWith("/auth/logout", StringComparison.OrdinalIgnoreCase))
  ```
- **Cơ chế:** Trực tiếp truy xuất `context.User.Identity.IsAuthenticated` mà không dùng toán tử null-conditional `?.`. Nếu trong một số cấu hình pipeline hoặc request bất thường `context.User.Identity` là `null`, dòng này sẽ lập tức ném ra ngoại lệ `NullReferenceException` (được cảnh báo bởi compiler warning CS8602).
- **Khuyến nghị:** Đổi thành:
  ```csharp
  if (context.User.Identity?.IsAuthenticated == true && !path.EndsWith("/auth/logout", StringComparison.OrdinalIgnoreCase))
  ```

---

### 🟡 SEC-07: Crash Khởi động khi Dùng File Cấu hình Production Mẫu
- **Phân loại:** OWASP A05:2021 — Security Misconfiguration.
- **Mức độ:** **Medium** | **Độ tin cậy:** Confirmed.
- **Vị trí:** [appsettings.Production.json](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Production.json#L22-L24) và [TokenService.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.Infrastructure/Identity/TokenService.cs#L77-L81):
  ```json
  "Auth": {
    "TokenHashSecret": ""
  }
  ```
- **Cơ chế:** `Program.cs` cấu hình `.ValidateOnStart()` cho `AuthTokenSettings`. Nếu người dùng chạy production với file cấu hình mẫu mà quên cấu hình biến môi trường `AUTH_TOKEN_HASH_SECRET`, ứng dụng sẽ crash ngay lập tức khi boot.

---

## 4. Đánh giá Các Biện pháp Phòng vệ Đã Triển khai (Security Defenses)

1. **SQL Injection**: ✅ **Tuyệt đối an toàn**. Toàn bộ 7/7 vị trí thực thi raw SQL đều dùng parameterized query qua `ExecuteCommandAsync` / `FromSqlInterpolated`.
2. **XSS & Content Security Policy**: ✅ Đã có `SecurityHeadersMiddleware` thiết lập `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. Phía client dùng `sanitize-html` và React virtual DOM tự động encode.
3. **Rate Limiting**: ✅ Đã áp dụng `RateLimiter` phân vùng thông minh theo IP/Host (`ResolveRateLimitKey`), ngăn chặn brute-force login (`LoginPolicy`: 20 req/phút).
4. **Password Hashing**: ✅ Dùng ASP.NET Core Identity mặc định với thuật toán PBKDF2 with HMAC-SHA256, 100,000 rounds.
5. **Session Revocation**: ✅ Đã sửa hàm hash token trong `RevokeTokenCommandHandler` để so sánh với `TokenHash` trong DB, vô hiệu hóa hoàn toàn token khi đăng xuất.
