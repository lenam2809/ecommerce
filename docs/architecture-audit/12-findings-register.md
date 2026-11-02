> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](../reports/KIEM_KE_HIEN_TRANG.md).

# 12. Sổ Cái Phát Hiện Tổng Hợp (Master Findings Register)

Tài liệu này là sổ cái trung tâm ghi nhận toàn bộ các phát hiện kỹ thuật (Findings) từ đợt kiểm toán hệ thống **ShopViet E-Commerce**. Mỗi phát hiện được định danh bằng mã ổn định (Stable ID), phân loại độ nghiêm trọng theo chuẩn CVSS/OWASP, mức độ tin cậy của bằng chứng, và trạng thái xử lý.

---

## 1. Bảng Quy Chuẩn Định Danh & Mức Độ

| Tiêu chí | Giá trị | Ý nghĩa |
|---|---|---|
| **Phân hệ** | `SEC` | Lỗ hổng bảo mật, xác thực, phân quyền |
| | `DATA` | Cơ sở dữ liệu, schema, index, tính toàn vẹn dữ liệu |
| | `FLOW` | Luồng nghiệp vụ e-commerce, transaction, trạng thái |
| | `ARCH` | Kiến trúc phần mềm, cấu trúc module, thiết kế hệ thống |
| | `PERF` | Hiệu năng, bộ nhớ, thuật toán, caching |
| | `FE` | Frontend (Client & Dashboard), UI/UX, tương thích |
| | `OPS` | Hạ tầng, container, Docker, CI/CD, biến môi trường |
| | `TEST` | Kiểm thử, coverage, chất lượng kiểm thử |
| **Mức độ (Severity)** | **CRITICAL** | Lỗ hổng khẩn cấp, nguy cơ rò rỉ dữ liệu hoặc sập hệ thống ngay lập tức |
| | **HIGH** | Lỗi logic nặng, thất thoát tài nguyên/tiền tệ, chặn chức năng cốt lõi |
| | **MEDIUM** | Sai lệch kỹ thuật, ảnh hưởng trải nghiệm hoặc hiệu năng khi tải cao |
| | **LOW** | Code smell, tài liệu không khớp, thiếu tối ưu nhỏ |
| **Độ tin cậy (Confidence)** | **CONFIRMED** | Đã xác minh trực tiếp bằng mã nguồn và test thực nghiệm |
| | **LIKELY** | Dấu hiệu rõ ràng trong code, nguy cơ cao trong điều kiện thực tế |
| | **POTENTIAL**| Rủi ro lý thuyết tùy thuộc vào môi trường vận hành |

---

## 2. Bảng Sổ Cái Phát Hiện Tổng Hợp (Master Findings Table)

| Mã ID | Phân hệ | Mức độ | Độ tin cậy | Bằng chứng (Tập tin & Dòng) | Tóm tắt Vấn đề & Tác động | Khuyến nghị Khắc phục | Trạng thái |
|---|---|---|---|---|---|---|---|
| **SEC-01** | Security | **CRITICAL** | CONFIRMED | `appsettings.Production.json:46-48`, `appsettings.Development.json:13-15, 27` | Lộ chuỗi kết nối Supabase PostgreSQL chứa mật khẩu plaintext và `ServiceRoleKey` admin trong git repository. Nguy cơ chiếm toàn quyền DB đám mây và storage. | Đổi khóa/mật khẩu Supabase ngay lập tức; xóa file khỏi git history bằng BFG; dùng Environment Variables. | Mở (Open) |
| **SEC-02** | Security | **CRITICAL** | CONFIRMED | `FileStorageService.cs:98-112`, `TestStorageController.cs:77` | Lỗ hổng Path Traversal khi xóa file: `Path.Combine` nối trực tiếp `filePath` từ query string mà không kiểm tra ranh giới thư mục. Kẻ tấn công có thể xóa file hệ thống tùy ý (`../../appsettings.json`). | Kiểm tra chuẩn hóa đường dẫn: Đảm bảo `normalizedPath.StartsWith(rootPath)`. Gỡ bỏ `TestStorageController` trên Production. | Mở (Open) |
| **SEC-03** | Security | **HIGH** | CONFIRMED | `AuthorizationBehavior.cs:25`, all MediatR Handlers | Pipeline `AuthorizationBehavior` kiểm tra attribute trên `request.GetType()`, nhưng các lập trình viên lại gắn `[Authorize]` trên các class `*Handler`. Dẫn đến MediatR pipeline hoàn toàn KHÔNG kiểm tra quyền nào! | Sửa `AuthorizationBehavior` để kiểm tra attribute trên cả Command và Handler tương ứng, hoặc chuyển attribute sang Command. | Mở (Open) |
| **SEC-04** | Security | **HIGH** | CONFIRMED | `RefreshTokenCommandHandler.cs:36-46`, `TokenService.cs:89-113` | Endpoint làm mới token yêu cầu Access Token chưa hết hạn (`ValidateLifetime = true`). Khi access token hết hạn 15 phút, người dùng bị cưỡng chế đăng xuất hoàn toàn, vô hiệu hóa cơ chế 7-day refresh token. | Thiết lập `ValidateLifetime = false` khi đọc claims từ access token đã hết hạn trong luồng refresh token. | Mở (Open) |
| **SEC-05** | Security | **HIGH** | CONFIRMED | `CsrfValidationMiddleware.cs:40-44` | Middleware bỏ qua kiểm tra CSRF nếu request không có cookie `access_token`. Khi access token hết hạn và chỉ còn `refresh_token`, endpoint `/api/auth/refresh-token` bị bypass CSRF hoàn toàn. | Bổ sung kiểm tra cả cookie `refresh_token`: `if (!hasAccessToken && !hasRefreshToken) skip;`. | Mở (Open) |
| **SEC-06** | Security | **HIGH** | CONFIRMED | `docker-compose/.env:10, 45`, `appsettings.json:30-31` | Khóa bí mật JWT, hash secret và thông tin kết nối DB, khóa bí mật VNPay bị hardcode và commit vào git repository. | Đưa `docker-compose/.env` vào `.gitignore`; xóa key khỏi git history; nạp qua Secret Manager. | Mở (Open) |
| **SEC-07** | Security | **MEDIUM** | CONFIRMED | `Ecommerce.WebAPI/Program.cs:247`, `ApplicationDbContextSeed.cs:186` | Gọi `ApplicationDbContextSeed.SeedAsync(..., true)` với `isDevelopment=true` hardcode. Khởi động lại trên Production sẽ tự động tiêm tài khoản Admin mặc định (`admin@Ecommerce.com` / `Admin@123456`). | Bọc trong điều kiện `if (app.Environment.IsDevelopment())` và buộc đổi mật khẩu lần đầu. | Mở (Open) |
| **SEC-08** | Security | **MEDIUM** | CONFIRMED | `UserActivitiesController.cs:12`, `ProductsController.cs:201` | Annotation `//[Authorize]` bị comment out tại class `UserActivitiesController` và action `ExportTemplate`. Bất kỳ ai cũng có thể truy xuất template hoặc trigger logic. | Bỏ dấu comment `[Authorize]` và gán Policy cụ thể (`EPermissions.ViewProducts`). | Mở (Open) |
| **SEC-09** | Security | **MEDIUM** | CONFIRMED | `Ecommerce.Application/Features/**` | Hơn 35 MediatR Command thiếu FluentValidation validator (bao gồm ResetPassword, CreateReview, CreateReturn, AssignRole, LockUser). Dễ bị bypass validation nếu gọi thẳng API. | Bổ sung toàn bộ class `AbstractValidator<TCommand>` cho các command thay đổi trạng thái. | Mở (Open) |
| **SEC-10** | Security | **MEDIUM** | CONFIRMED | `Program.cs:112-175`, `Ecommerce.WebAPI/Controllers/**` | Rate Limiter chỉ gắn trên `AuthController`; 31 controller còn lại chia sẻ chung quota 1,000 req/min. Thiếu rate limiter riêng cho CreateOrder, Search, VNPay Callback. | Gắn các Rate Limiting Policy chuyên biệt cho các endpoint tốn tài nguyên hoặc nhạy cảm. | Mở (Open) |
| **SEC-11** | Security | **LOW** | CONFIRMED | `TokenService.cs:54` | Dùng `DateTime.Now` (giờ cục bộ của máy chủ) thay vì `DateTime.UtcNow` khi tạo claim `Expires` trong JWT. Dễ gây lệch thời gian sống token khi máy chủ đổi múi giờ. | Đổi thành `DateTime.UtcNow.AddMinutes(...)`. | Mở (Open) |
| **DATA-01** | Database | **CRITICAL** | CONFIRMED | `CartItemConfiguration.cs:15` | Khóa chính tổng hợp `{ CartId, ProductId }`. Người dùng không thể thêm 2 biến thể (SKU) khác nhau của cùng 1 sản phẩm vào giỏ hàng mà không bị lỗi DB Unique Constraint. | Đổi khóa chính sang `Id` (GUID) và tạo Unique Index theo `{ CartId, ProductVariantSkuId }`. | Mở (Open) |
| **DATA-02** | Database | **MEDIUM** | CONFIRMED | `AGENTS.md:12`, `README.md` | Tài liệu khẳng định hệ thống dùng SQL Server cho local dev. Nhưng mã nguồn không có package `Microsoft.EntityFrameworkCore.SqlServer` (chỉ có Npgsql và Sqlite). | Cập nhật tài liệu khớp thực tế: Dự án dùng PostgreSQL (Production/Docker) và SQLite (Local/Test). | Mở (Open) |
| **DATA-03** | Database | **MEDIUM** | LIKELY | `CategoryConfiguration.cs:20`, `BrandConfiguration.cs:18` | Các chỉ mục Unique Index trên cột `Slug` không có bộ lọc `IsDeleted = false`. Khi xóa mềm một danh mục, không thể tạo lại danh mục mới có cùng slug. | Bổ sung `.HasFilter("\"IsDeleted\" = false")` cho toàn bộ các Unique Index trên các entity có xóa mềm. | Mở (Open) |
| **DATA-04** | Database | **LOW** | CONFIRMED | `OrderConfiguration.cs` | Thiếu chỉ mục composite trên bảng `Orders` theo `(UserId, CreatedAt DESC)` và `(Status, CreatedAt DESC)`. Khi danh sách đơn hàng lớn, trang quản trị lọc và phân trang sẽ bị chậm. | Thêm composite index trong cấu hình Fluent API của `Order`. | Mở (Open) |
| **FLOW-01** | Business | **CRITICAL** | CONFIRMED | `CreateOrderCommandHandler.cs:105-125` | Trừ tồn kho bằng `ExecuteUpdateAsync` diễn ra ngoài EF Core Transaction. Nếu `_unitOfWork.CompleteAsync()` thất bại văng lỗi bất ngờ, kho bị trừ mà đơn không lưu được. | Bọc toàn bộ khối trừ kho và lưu đơn trong một `IDbContextTransaction` rõ ràng. | Mở (Open) |
| **FLOW-02** | Business | **HIGH** | CONFIRMED | `OrderStatusChangedEventHandler.cs:77-101` | Khi hủy đơn hàng, code cập nhật tồn kho nhầm trên đối tượng `Product` thay vì `ProductVariantSku`, và QUÊN gọi `CompleteAsync()`, dẫn đến tồn kho không hề được hoàn lại. | Sửa logic trỏ về `ProductVariantSku` và gọi `await _unitOfWork.CompleteAsync(cancellationToken)`. | Mở (Open) |
| **FLOW-03** | Business | **HIGH** | CONFIRMED | `Ecommerce.Application/Returns/EventHandlers` | Sự kiện `ReturnRequestCompletedEvent` hoàn toàn không có Event Handler. Khi Admin nghiệm thu và hoàn tất quy trình đổi trả hàng (RMA), kho hàng không được nhập lại. | Tạo `ReturnRequestCompletedEventHandler` để tự động cộng lại tồn kho cho các SKU tương ứng. | Mở (Open) |
| **FLOW-04** | Business | **MEDIUM** | CONFIRMED | `ProcessRefundCommandHandler.cs` | Nghiệp vụ hoàn tiền cho giao dịch thanh toán trực tuyến mới chỉ cập nhật trạng thái trong cơ sở dữ liệu, chưa gọi API hoàn tiền tự động sang cổng thanh toán VNPay. | Tích hợp VNPay Refund API (`vnp_Command=refund`) vào quy trình phê duyệt hoàn tiền. | Mở (Open) |
| **ARCH-01** | Architecture | **HIGH** | CONFIRMED | `NoOpProductSearchService.cs:25` | Tài liệu cam kết khi tắt Elasticsearch sẽ fallback sang tìm kiếm SQL LIKE. Thực tế service ném `SearchServiceUnavailableException` (HTTP 503) khiến chức năng tìm kiếm bị sập hoàn toàn. | Thay thế nội dung `NoOpProductSearchService` bằng truy vấn EF Core `Contains` trên `Product.Name` và `Description`. | Mở (Open) |
| **ARCH-02** | Architecture | **MEDIUM** | CONFIRMED | `Program.cs` / `Scrutor` | Đăng ký DI tự động quét assembly rộng có thể dẫn đến việc ghi đè service không mong muốn nếu có nhiều class cùng implement một interface. | Rà soát và chỉ định rõ lifetime (Scoped vs Singleton) cho các service quan trọng. | Mở (Open) |
| **PERF-01** | Performance | **HIGH** | CONFIRMED | `GetRevenueByCategoryQueryHandler.cs:27-51`, `GetRevenueByMonthQueryHandler.cs:40-66` | Tải toàn bộ đơn hàng trong 1 năm về RAM máy chủ và thực hiện `Sum()` và `GroupBy()` bằng C# thay vì để DB xử lý. Nguy cơ OOM (Out Of Memory) khi lượng đơn lớn. | Viết lại câu truy vấn LINQ đẩy phép toán `GroupBy` và `Sum` xuống SQL Server/PostgreSQL. | Mở (Open) |
| **PERF-02** | Performance | **MEDIUM** | CONFIRMED | `GetProductByIdQueryHandler.cs` | Điểm đánh giá trung bình (`AverageRating`) và tổng số đánh giá được tính toán động bằng cách quét bảng `Reviews` mỗi lần người dùng xem chi tiết sản phẩm. | Lưu cột `AverageRating` và `ReviewCount` trực tiếp trên bảng `Products` và cập nhật thông qua Domain Event khi có review mới. | Mở (Open) |
| **PERF-03** | Performance | **LOW** | LIKELY | `CategoriesController.GetTree` | Cây danh mục không có HTTP response caching header (`Cache-Control`), khiến mỗi lượt tải trang khách đều phải gọi lại DB mặc dù danh mục rất ít khi thay đổi. | Bổ sung Response Caching middleware hoặc thẻ cache 1 giờ cho API danh mục. | Mở (Open) |
| **FE-01** | Frontend | **HIGH** | CONFIRMED | `ecommerce-client/app/(auth)/register/page.tsx:77` vs `RegisterCommandValidator.cs:15` | Mismatch validation mật khẩu: Client cho phép `>= 6` ký tự tự do; Server bắt buộc `>= 12` ký tự phức tạp (hoa, thường, số, ký tự đặc biệt). Khách đăng ký 6-11 ký tự bị lỗi im lặng. | Cập nhật Zod validation schema tại Client đồng bộ 100% với Server. | Mở (Open) |
| **FE-02** | Frontend | **HIGH** | CONFIRMED | `ecommerce-client/middleware.ts:13` vs `login/page.tsx:50` | Middleware gắn query `?from=/checkout`, nhưng trang Login lại chỉ đọc `returnUrl` và `redirect`. Sau khi đăng nhập xong, khách luôn bị đưa về trang chủ thay vì quay lại checkout. | Đọc cả `from` và `returnUrl` tại `login/page.tsx` để điều hướng chính xác. | Mở (Open) |
| **FE-03** | Frontend | **HIGH** | CONFIRMED | `ecommerce-dashboard/middleware.ts:107-120` | Dashboard middleware chỉ kiểm tra `Boolean(profile?.userId)`, không kiểm tra vai trò `Admin/Manager`. Khách hàng bình thường có thể xem giao diện quản trị. | Thêm kiểm tra role trong middleware trước khi cho phép vào các route `/dashboard`, `/roles`, v.v. | Mở (Open) |
| **FE-04** | Frontend | **MEDIUM** | CONFIRMED | `apps/frontend/package.json` | Sự phân kỳ phiên bản React: Client dùng React 19.0.0, trong khi Dashboard dùng React 18.3.1. Gây khó khăn khi chia sẻ thư viện components hoặc migrate code. | Lập kế hoạch nâng cấp Dashboard lên React 19 để đồng nhất hệ sinh thái frontend. | Mở (Open) |
| **FE-05** | Frontend | **MEDIUM** | CONFIRMED | `npm run lint` (Client & Dashboard) | Có 76 cảnh báo ESLint, chủ yếu là `react-hooks/exhaustive-deps` và biến không dùng `@typescript-eslint/no-unused-vars`. | Dọn dẹp cảnh báo để đảm bảo pipeline CI/CD sạch sẽ và tránh bug stale closure trong hooks. | Mở (Open) |
| **TEST-01** | Testing | **HIGH** | CONFIRMED | `Ecommerce.Application.Tests` | 4 unit test kiểm thực địa phương hóa (Localization/Validation) bị thất bại do phụ thuộc vào `CultureInfo` máy chạy test. | Thiết lập `CultureInfo.InvariantCulture` cố định trong Test Fixtures. | Mở (Open) |
| **TEST-02** | Testing | **HIGH** | CONFIRMED | `apps/frontend/ecommerce-client`, `ecommerce-dashboard` | Cả 2 dự án Frontend Next.js hoàn toàn KHÔNG CÓ bất kỳ file test nào (0 unit test, 0 integration test, 0 e2e test). | Thiết lập Vitest + React Testing Library và viết bộ test cơ bản cho Auth và Cart. | Mở (Open) |
| **OPS-01** | DevOps | **CRITICAL** | CONFIRMED | `docker-compose/.env:57`, `docker-compose.yml` | Biến `NEXT_PUBLIC_API_URL=http://backend:5000/api` sử dụng hostname nội bộ Docker `backend`. Trình duyệt máy host không thể phân giải tên miền này -> Web sập API. | Cấu hình `NEXT_PUBLIC_API_URL=http://localhost:5000/api` cho các request phía browser. | Mở (Open) |
| **OPS-02** | DevOps | **MEDIUM** | CONFIRMED | `render.yaml:4, 11` | Dịch vụ backend cấu hình trên Render Web Service Free Tier; `healthCheckPath` trỏ vào `/swagger/index.html` trong khi Swagger bị tắt trên Production -> Deploy fail liên tục. | Đổi `healthCheckPath` sang `/api/health` và nâng cấp cấu hình hoặc ping định kỳ. | Mở (Open) |

---

## 3. Thống Kê Sổ Cái Phát Hiện

```
┌─────────────────────────────────┬──────────┐
│ Tiêu chí thống kê               │ Số lượng │
├─────────────────────────────────┼──────────┤
│ Tổng số phát hiện (Findings)    │ 30       │
│ Mức độ CRITICAL (Khẩn cấp)      │ 6        │
│ Mức độ HIGH (Cao)               │ 13       │
│ Mức độ MEDIUM (Trung bình)      │ 9        │
│ Mức độ LOW (Thấp)               │ 2        │
│ Mức độ tin cậy CONFIRMED        │ 28       │
│ Mức độ tin cậy LIKELY/POTENTIAL │ 2        │
└─────────────────────────────────┴──────────┘
```

---

## 4. Quy Trình Vận Hành & Khắc Phục

1. **Gán đầu việc (Assignment):** Mỗi phát hiện từ sổ cái này cần được chuyển thành Issue/Ticket trên GitHub/Jira kèm theo mã ID gốc (ví dụ: `[SEC-01] Thu hồi live Supabase credentials`).
2. **Kiểm tra chéo (Regression Check):** Khi một lỗi được sửa, kỹ sư phải bổ sung ít nhất một Unit Test hoặc Integration Test tự động để đảm bảo không bị tái phát trong tương lai.
3. **Cập nhật trạng thái:** Trạng thái trong sổ cái chỉ được chuyển từ `Mở (Open)` sang `Đã xử lý (Resolved)` sau khi Pull Request liên quan đã được merge và kiểm thử thành công trên môi trường Staging.
