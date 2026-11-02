> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](../architecture-backend.md).

# 04 — Kiểm toán API & Luồng Dữ liệu (API & Data Flow)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** Toàn bộ 32 Controllers trong `Ecommerce.WebAPI`, các hợp đồng dữ liệu, cơ chế xác thực và phân quyền.

---

## 1. Bảng Kiểm toán Chi tiết 32 API Controllers

| Controller | Tuyến đường cơ sở | Xác thực (AuthN) | Phân quyền (AuthZ) | Dữ liệu truy cập | Đánh giá Rủi ro & Khoảng trống |
|---|---|---|---|---|---|
| **AboutController** | `/api/About` | Tùy chọn | Admin cho mutation (PUT/POST) | `Abouts` | ✅ Tách biệt view public và edit admin |
| **AccountController** | `/api/Account` | Bắt buộc (`[Authorize]`) | Current User | `Users` (Profile, Password) | ✅ Profile gắn chặt với `User.GetUserId()` |
| **AccountLocksController** | `/api/AccountLocks` | Bắt buộc (`[Authorize]`) | Role: `Admin` | `AccountLocks` | ✅ Admin mới được khóa/mở tài khoản |
| **AddressesController** | `/api/Addresses` | Bắt buộc (`[Authorize]`) | Current User | `CustomerAddresses` | ✅ IDOR check: kiểm tra `UserId == currentUserId` |
| **AuthController** | `/api/Auth` | Public / Partial | Anonymous / Current User | `Users`, `RefreshTokens` | ⚠️ CSRF bypass trên `/refresh-token` nếu cookie `access_token` hết hạn |
| **BannerController** | `/api/Banner` | Public / Partial | Admin cho mutation | `Banners` | ✅ Public xem, Admin chỉnh sửa |
| **BrandsController** | `/api/Brands` | Public / Partial | Policy: `EPermissions.ViewBrands` / `EditBrand` | `Brands` | ✅ Đã gắn Policy bảo vệ |
| **CartController** | `/api/Cart` | Public (hỗ trợ Dual) | User DB / Guest Redis | `Carts`, `CartItems`, Redis | ✅ Đã chuyển sang cookie `guest_id` do server sinh |
| **CategoriesController** | `/api/Categories` | Public / Partial | Policy: `EPermissions.ViewCategories`... | `Categories` | ✅ Public xem, Admin quản lý |
| **ContactController** | `/api/Contact` | Public / Partial | Admin cho mutation | `Contacts` | ✅ Hỗ trợ liên hệ |
| **DashboardController** | `/api/Dashboard` | Bắt buộc (`[Authorize]`) | Roles: `Admin`, `Employee` | Tổng hợp Doanh thu, Orders, Users | ✅ Đã khóa quyền quản trị viên |
| **InventoryController** | `/api/Inventory` | Bắt buộc (`[Authorize]`) | Roles: `Admin`, `Employee` | `InventoryItems`, `ProductVariantSkus` | ✅ Đã khóa quyền quản trị viên |
| **LogsController** | `/api/Logs` | Bắt buộc (`[Authorize]`) | Role: `Admin` | `LogEntries`, `LogProperties` | ✅ **Đã vá (H1)**: Trước đây bỏ trống `[Authorize]` |
| **MarqueeAdminController** | `/api/MarqueeAdmin` | Bắt buộc (`[Authorize]`) | Role: `Admin` | `MarqueeMessages`, `MarqueeSettings` | ✅ Đã khóa Admin |
| **MarqueeController** | `/api/Marquee` | Public | Anonymous | `MarqueeMessages` (Active) | ✅ Chỉ trả thông điệp đang kích hoạt |
| **NotificationController**| `/api/Notification` | Bắt buộc (`[Authorize]`) | Current User | `Notifications` | ⚠️ Cần kiểm tra IDOR khi đánh dấu đọc notification |
| **OrdersController** | `/api/Orders` | Bắt buộc (`[Authorize]`) | Current User / Admin | `Orders`, `OrderItems` | ✅ **Đã vá (H4)**: Buộc ghi đè UserId khi tạo đơn |
| **PaymentsController** | `/api/Payments` | Partial | Public (Webhook) / `[Authorize]` (Create) | `PaymentTransactions`, `Payments` | ✅ HMACSHA512 checksum, chống replay |
| **PermissionsController** | `/api/Permissions` | Bắt buộc (`[Authorize]`) | Role: `Admin` | `Permissions`, `RolePermissions` | ✅ Đã khóa Admin |
| **ProductsController** | `/api/Products` | Public / Partial | Policies: `ViewProducts`, `CreateProduct`... | `Products`, `ProductVariantSkus` | ⚠️ `[HttpGet("export-template")]` bị comment `//[Authorize]` |
| **PromoCodesController** | `/api/PromoCodes` | Partial | Public (Validate) / Admin (CRUD) | `PromoCodes` | ✅ Khách kiểm tra mã, Admin tạo mã |
| **ReportsController** | `/api/Reports` | Bắt buộc (`[Authorize]`) | Roles: `Admin`, `Employee` | Tổng hợp Báo cáo tài chính | ✅ Đã khóa Admin/Employee |
| **ReturnsController** | `/api/Returns` | Bắt buộc (`[Authorize]`) | Current User (Create) / Admin (Approve) | `ReturnRequests`, `ReturnEvidence` | ✅ User chỉ xem đơn trả hàng của mình |
| **ReviewsController** | `/api/Reviews` | Public / Partial | `[Authorize]` (Create, Like) | `Reviews`, `ReviewImages` | ✅ Có migration Unique constraint chống spam |
| **RolesController** | `/api/Roles` | Bắt buộc (`[Authorize]`) | Role: `Admin` | `Roles`, `UserRoles` | ✅ Đã khóa Admin |
| **SearchController** | `/api/Search` | Public | Anonymous | Elasticsearch / Products DB | ✅ Fallback SQL LIKE nếu ES offline |
| **SearchSuggestionsController** | `/api/SearchSuggestions` | Public | Anonymous | Elasticsearch Suggest / Products DB | ✅ Giới hạn số lượng gợi ý |
| **TestStorageController** | `/api/TestStorage` | Public | Attribute: `[DevelopmentOnly]` | Supabase Storage Test | ⚠️ Controller test còn trong source (trả 404 trên prod) |
| **UserActivitiesController**| `/api/UserActivities` | **Không có [Authorize]** | `[HttpGet]` và `/recent` mở public | `UserActivities` | ⚠️ **Lỗ hổng bảo mật**: `//[Authorize]` class-level bị comment |
| **UsersController** | `/api/Users` | Bắt buộc (`[Authorize]`) | Policies: `EPermissions.ViewUsers`... | `Users` | ✅ **Đã vá (H3)**: Đã thêm Policy cho paged & top users |
| **WeatherForecastController**| `/WeatherForecast` | Public | Attribute: `[DevelopmentOnly]` | In-memory Mock Data | ⚠️ Controller template mặc định chưa xóa (trả 404 trên prod) |
| **WishlistController** | `/api/Wishlist` | Bắt buộc (`[Authorize]`) | Current User | `Wishlists`, `WishlistItems` | ✅ User chỉ xem/thao tác wishlist của mình |

---

## 2. Hợp đồng Dữ liệu & Cơ chế Xử lý Ngoại lệ (API Contracts)

### 2.1. Phản hồi Chuẩn hóa (Response Wrapper)
Mọi MediatR handler trả về kiểu `Result<T>`:
```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T Value { get; }
    public string Error { get; }
    public int StatusCode { get; }
    public Dictionary<string, string[]>? ValidationErrors { get; }
}
```
Thông qua extension method `result.ToActionResult()` trong `Ecommerce.WebAPI/Extensions/ResultExtensions.cs`, đối tượng này được chuyển đổi tương ứng thành:
- `200 OK` (hoặc `201 Created`): khi `IsSuccess = true`.
- `400 Bad Request`: lỗi logic nghiệp vụ thông thường.
- `401 Unauthorized`: thiếu token hoặc token không hợp lệ.
- `403 Forbidden`: thiếu role hoặc policy được yêu cầu.
- `404 Not Found`: không tìm thấy thực thể.
- `422 Unprocessable Entity`: lỗi validation dữ liệu đầu vào.
- `423 Locked`: tài khoản người dùng đang bị khóa hệ thống.

### 2.2. Global Exception Handling
Middleware `GlobalExceptionHandlingMiddleware.cs` bọc toàn bộ pipeline:
- Mọi exception chưa bắt được (unhandled) sẽ trả về mã HTTP thích hợp kèm `correlationId` (từ `X-Correlation-ID` header) để truy vết log mà **không làm lộ stack trace** ra client.
- FluentValidation exceptions được tự động map thành HTTP 422 với danh sách lỗi chi tiết theo từng property.

---

## 3. Xác thực & Phân quyền (Authentication & Authorization)

### 3.1. Dual-Authentication Flow
1. **Cookie-based (Ưu tiên cho Web Browser)**:
   - Access token được lưu trong cookie `access_token` (`HttpOnly`, `SameSite=Lax` / `None`, `Secure`).
   - Refresh token được lưu trong cookie `refresh_token` (`HttpOnly`).
   - CSRF token được lưu trong cookie `csrf_token` (cho phép client đọc để gửi lại qua header `X-CSRF-Token`).
2. **Bearer Token (Ưu tiên cho Mobile / Swagger / Integrations)**:
   - Client gửi header `Authorization: Bearer <token>`.
   - Cờ cấu hình `AuthConfig:AllowHeaderFallback = true` cho phép fallback sang đọc Bearer header khi không có cookie.

### 3.2. Role-Based & Policy-Based Access Control
- Hệ thống hỗ trợ 2 vai trò chuẩn: `Admin` và `Employee` (`EUserRoles.cs`).
- Hệ thống phân quyền chi tiết (RBAC Granular) qua 38 quyền hạn (`EPermissions.cs`):
  - Nhóm User: `ViewUsers`, `CreateUser`, `EditUser`, `DeleteUser`.
  - Nhóm Product: `ViewProducts`, `CreateProduct`, `EditProduct`, `DeleteProduct`.
  - Nhóm Order: `ViewOrders`, `EditOrder`, `CancelOrder`...
  - Nhóm Report: `ViewReports`, `ExportReports`...
- Extension `AddAuthorizationPolicies()` tự động duyệt toàn bộ các giá trị của `EPermissions` và đăng ký thành Authorization Policy với `RequireClaim(AuthorizationClaimTypes.Permission, permissionName)`.

---

## 4. Các Rủi ro API Đã Xác minh (Confirmed API Risks)

1. **`UserActivitiesController` thiếu `[Authorize]` class-level**:
   - `[Route("api/[controller]")]`
   - Dòng 12: `//[Authorize]` bị comment.
   - Endpoint `GET /api/UserActivities` và `GET /api/UserActivities/recent` không có attribute phân quyền, cho phép anonymous gọi vào. Mặc dù bên trong handler có kiểm tra `targetUserId`, việc để lộ endpoint không có guard ở tầng controller làm tăng bề mặt tấn công.
2. **`ProductsController.ExportTemplate` không có `[Authorize]`**:
   - Dòng 201: `//[Authorize(Policy = EPermissions.EditProduct)]` bị comment.
   - Bất kỳ ai cũng có thể tải về file mẫu cấu trúc sản phẩm của hệ thống.
3. **Thiếu CancellationToken tại một số Controller Actions**:
   - Một số action controller không nhận hoặc không truyền `CancellationToken` xuống MediatR (ví dụ: `ExportProductsTemplateCommand`, `GetUserActivitiesQuery`), khiến tác vụ database vẫn tiếp tục chạy ngốn tài nguyên server kể cả khi client đã ngắt kết nối (Client Disconnect).
