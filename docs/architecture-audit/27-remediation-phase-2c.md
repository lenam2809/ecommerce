> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 15/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/architecture-backend.md`](../architecture-backend.md).

# 27. Báo Cáo Nghiệm Thu Khắc Phục Giai Đoạn 2C (Remediation Phase 2C Report)
## Security, Authorization & Reporting Remediation

**Ngày thực hiện:** 2026-10-15  
**Kiến trúc sư phụ trách:** Senior Software Architect, Application Security Engineer & Senior .NET Developer  
**Trạng thái:** **COMPLETED & VERIFIED (Lưu tiến trình theo yêu cầu người dùng)**  

---

## 1. Git & Phạm Vi Thực Hiện

- **Branch hiện tại:** `main`
- **Commit gốc (HEAD):** `8fa055d` (*fix(data-integrity): củng cố an toàn giao dịch tạo đơn, khóa CartItem cho biến thể và hoàn kho (Phase 2B)*)
- **Quy tắc tuân thủ:**
  - Không commit, không push mã nguồn tự động.
  - Không sửa `.gitignore`.
  - Không thay đổi database schema / không thêm migration (Zero Migration Phase).
  - Không rò rỉ token/secret trong logs và tài liệu.

### Danh Sách Tệp Đã Thay Đổi (`git status --short`):
```text
 M apps/backend/Ecommerce/Ecommerce.Application/Common/Behaviors/AuthorizationBehavior.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Orders/Queries/GetOrderById/GetOrderByIdQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Commands/ExportProductsTemplate/ExportProductsTemplateCommand.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Queries/GetPagedProducts/GetPagedProductsQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Queries/GetProductById/GetProductByIdQuery.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Queries/GetProductById/GetProductByIdQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Products/Queries/GetProducts/GetProductsQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Reports/Queries/GetRevenueByCategory/GetRevenueByCategoryQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Reports/Queries/GetRevenueByMonth/GetRevenueByMonthQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Reports/Queries/GetRevenueComparison/GetRevenueComparisonQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Reports/Queries/GetRevenueOverview/GetRevenueOverviewQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Application/Features/Reports/Queries/GetRevenueTrend/GetRevenueTrendQueryHandler.cs
 M apps/backend/Ecommerce/Ecommerce.Infrastructure/Services/FileStorageService.cs
 M apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/ProductsController.cs
 M apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/UserActivitiesController.cs
?? apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests/RemediationPhase2CTests.cs
?? docs/architecture-audit/26-remediation-phase-2c-plan.md
?? docs/architecture-audit/27-remediation-phase-2c.md
```

---

## 2. Bảng Ma Trận Finding (Finding Matrix)

| Finding | Severity | Baseline | Root Cause | Remediation | Test Result | Final Status |
|---|---|---|---|---|---|---|
| **SEC-02** | High / Low (Latent) | **FAIL** (`DeleteFileAsync` xóa file ngoài `wwwroot`) | `FileStorageService.DeleteFileAsync` dùng `Path.Combine` thiếu kiểm tra ranh giới thư mục gốc | Chuẩn hóa `Path.GetFullPath` và kiểm tra containment `StartsWith(normalizedRoot)` kèm separator | `SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal` **PASS**; bộ test `RemediationPhase2CTests.SEC02_*` 3/3 **PASS** | **RESOLVED** |
| **SEC-03** | High / Medium | **FAIL** (Anonymous gọi `export-template` trả 200 OK) | Action `ExportTemplate` và class `UserActivitiesController` bị comment `[Authorize]`; `AuthorizationBehavior` chỉ đọc attribute trên request mà không quét handler | 1. Bật `[Authorize(Policy = EPermissions.CreateProduct)]` trên controller & command.<br/>2. Bật `[Authorize]` trên `UserActivitiesController`.<br/>3. Nâng cấp `AuthorizationBehavior` quét cả Request và Handler có cache reflection.<br/>4. Loại bỏ attribute nhầm lẫn trên các handler công khai (`GetPagedProductsQueryHandler`, `GetProductsQueryHandler`, `GetOrderByIdQueryHandler`). | `AuditVerificationTests.SEC03_*` **PASS**; `RemediationPhase2CTests.SEC03_*` 7/7 **PASS**; `AuthorizationBehaviorTests` 6/6 **PASS** | **RESOLVED** |
| **REPORT** | High | **FAIL** (Doanh thu tháng 3 = 0 do đơn 31/3 12:00 bị loại) | Dùng `endDate = startDate.AddMonths(1).AddDays(-1)` kết hợp `OrderDate <= endDate` loại bỏ toàn bộ đơn sau 00:00 ngày cuối tháng; tải toàn bộ entity graph vào RAM | 1. Sửa toàn bộ điều kiện khoảng thời gian thành nửa mở `[startDate, nextMonthStart)` và chuẩn hóa `DateTime.UtcNow`.<br/>2. Áp dụng projection tinh gọn (scalar projection) qua `IQueryable` tương thích cả SQLite in-memory và PostgreSQL/SQL Server, giải phóng RAM. | `AuditVerificationTests.REPORT_*` **PASS**; `RemediationPhase2CTests.REPORT_*` 4/4 **PASS** | **RESOLVED** |

---

## 3. Kết Quả Kiểm Thử Thực Tế Chi Tiết

### 3.1. Bộ Kiểm Thử Kiểm Toán Ban Đầu (`AuditVerificationTests.cs`)
- **Lệnh chạy:**
  ```bash
  dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "FullyQualifiedName~AuditVerificationTests"
  ```
- **Kết quả:** **7/7 PASSED (100%)** (Thời gian chạy: 1m 20s).
  - `SEC03_Anonymous_CannotDownloadProductImportTemplate`: **PASSED** (Trước Phase 2C: FAIL trả về HTTP 200, nay chặn 401 Unauthorized chính xác).
  - `SEC04_RefreshToken_WorksWhenOnlyRefreshCookieIsPresent`: **PASSED**.
  - `DATA01_AddingTwoVariantsOfSameProduct_KeepsBothCartLines`: **PASSED**.
  - `FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock`: **PASSED**.
  - `FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler`: **PASSED**.
  - `REPORT_RevenueByMonth_IncludesOrdersPlacedOnLastDayOfMonth`: **PASSED** (Trước Phase 2C: FAIL doanh thu = 0, nay tính đầy đủ đơn ngày 31/03 12:00 UTC).
  - `SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal`: **PASSED** (Trước Phase 2C: FAIL xóa file ngoài wwwroot, nay chặn hoàn toàn và trả về false).

### 3.2. Bộ Kiểm Thử Mới Phase 2C (`RemediationPhase2CTests.cs`)
- **Lệnh chạy:**
  ```bash
  dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "FullyQualifiedName~RemediationPhase2CTests"
  ```
- **Kết quả:** **19/19 PASSED (100%)** (Thời gian chạy: 3m 01s).
  - Nhóm SEC-02: 3/3 Passed (chặn các vector traversal `../`, `../../`, `uploads/../../`, `..\`, xử lý an toàn input rỗng, xóa thành công file hợp lệ trong webRoot).
  - Nhóm SEC-03: 7/7 Passed (người dùng ẩn danh bị chặn 401 tại `export-template` và `UserActivities`, khách hàng Customer bị chặn 403 khi tải template hoặc xem activity của user khác, Admin được phép tải template, khách hàng duyệt sản phẩm và danh mục công khai bình thường).
  - Nhóm REPORT: 4/4 Passed (tính đầy đủ đơn cuối ngày 23:59:00, loại trừ đúng đơn 00:00:00 của tháng kế tiếp, tổng hợp doanh thu theo danh mục sắp xếp giảm dần, xu hướng doanh thu theo tuần chính xác).

### 3.3. Kiểm Thử Đơn Vị Tầng Application (`Ecommerce.Application.Tests`)
- **Tổng thể:** `Passed: 201, Failed: 5, Skipped: 0, Total: 206` (Khớp 100% với baseline Phase 2B, không phát sinh bất kỳ regression nào).
- `AuthorizationBehaviorTests`: **6/6 PASSED** (Xác nhận logic behavior hoạt động chuẩn xác với request công khai, role-protected, policy-protected và composite policy).
- `GetProductByIdQueryHandlerTests`: **4/4 PASSED** (Xác nhận query và handler phân quyền catalog và policy ViewProducts hoạt động chuẩn xác).
- 5 baseline failures của `Ecommerce.Application.Tests` được giữ nguyên vẹn (thuộc phạm vi Phase 2A cũ về localization tiếng Việt vs tiếng Anh và cờ validator refresh token).

### 3.4. Kiểm Thử Hồi Quy Module Liên Quan (`Ecommerce.WebAPI.IntegrationTests`)
- `ProductsEndpointsTests` & `Phase0AuthorizationTests`: **15/15 PASSED** (Không có bất kỳ hồi quy nào trên các endpoint sản phẩm và authorization).

### 3.5. Frontend Production Builds
- `ecommerce-client`: `npm run build` -> **Thành công (Exit Code 0)**, biên dịch 22 static/dynamic routes.
- `ecommerce-dashboard`: `npm run build` -> **Thành công (Exit Code 0)**, biên dịch 44 routes quản trị.

---

## 4. Đánh Giá Bảo Mật & Kiến Trúc (Security & Architecture Review)

1. **Phân quyền đa tầng (Defense-in-depth):**
   - Tầng ngoại vi (HTTP Controller) đóng vai trò là cửa chặn đầu tiên đối với các request không hợp lệ.
   - Tầng trung tâm (MediatR `AuthorizationBehavior`) đóng vai trò lớp bảo vệ thứ hai cho business logic, quét cả metadata trên Command/Query và Handler thông qua bộ nhớ đệm reflection (`ConcurrentDictionary`), loại bỏ rủi ro khi có lập trình viên quên gắn attribute trên Controller.
   - Các API công khai cho khách hàng mua sắm (`/api/products/paged`, `/api/Categories`) được rà soát và bảo đảm không bị gắn nhầm attribute admin, giữ vững trải nghiệm người dùng cuối.
2. **Ngăn chặn triệt để Path Traversal:**
   - `FileStorageService.DeleteFileAsync` loại bỏ hoàn toàn khả năng can thiệp vào các tệp ngoài thư mục `wwwroot` thông qua việc chuẩn hóa đường dẫn tuyệt đối bằng `Path.GetFullPath` và so sánh tiền tố với separator hệ thống.
3. **Tính toàn vẹn số liệu báo cáo & Hiệu năng:**
   - Xóa bỏ triệt để lỗi biên ngày cuối tháng/cuối tuần bằng quy tắc khoảng nửa mở `[Start, End)`.
   - Chuyển đổi cơ chế tính toán sang projection tinh gọn, chỉ lấy các trường cần thiết (`OrderDate`, `Quantity * UnitPrice`, `CategoryName`), tương thích hoàn toàn với cả SQLite in-memory và database production, tránh nguy cơ OOM.

---

## 5. Kết Luận & Quyết Định Nghiệm Thu

- Cả 3 finding **SEC-02, SEC-03, REPORT** đã được khắc phục hoàn chỉnh, kiểm thử độc lập và xác nhận bằng bằng chứng thực tế.
- Toàn bộ tiến trình làm việc và mã nguồn đã được bảo toàn nguyên vẹn trên working tree.
- **Trạng thái:** **READY FOR REVIEW / COMPLETED PHASE 2C**.
