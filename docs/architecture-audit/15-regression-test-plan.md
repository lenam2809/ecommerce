> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/frontend-manual-test-checklist.md`](../frontend-manual-test-checklist.md) và [`AGENTS.md`](../../AGENTS.md).

# 15. Kế Hoạch Test Hồi Quy

Quy ước: test **assert hành vi đúng**; đang đỏ = lỗi còn tồn tại. Trait `Category=AuditRepro`. Chạy:
`dotnet test apps/backend/Ecommerce/Ecommerce.WebAPI.IntegrationTests --filter "Category=AuditRepro"` và tương tự cho `Ecommerce.Application.Tests`. Chạy thường quy: `--filter "Category!=AuditRepro"`.
Môi trường: integration test dùng SQLite + `CustomWebApplicationFactory` (env `IntegrationTesting`, seed user). Không chạm production, không gọi dịch vụ ngoài.

## A. Đã viết và đã chạy (đều đỏ ⇒ tái hiện)

| Mã | Tệp / test | Dữ liệu | Điều kiện đạt khi đã sửa |
|---|---|---|---|
| SEC-03 | `AuditVerificationTests.SEC03_Anonymous_CannotDownloadProductImportTemplate` | ẩn danh | 401/403 |
| SEC-04 | `...SEC04_RefreshToken_WorksWhenOnlyRefreshCookieIsPresent` | login customer seed, chỉ cookie `refresh_token` | 200, cấp cặp token mới |
| DATA-01 | `...DATA01_AddingTwoVariantsOfSameProduct_KeepsBothCartLines` | sản phẩm không biến thể, stock≥10; Red/M rồi Blue/L | cả hai 2xx, 2 dòng trong DB |
| FLOW-02b | `...FLOW02_CancellingOrderWithVariantSku_RestoresSkuStock` | SKU stock 5, đơn qty 2, stock giả lập còn 3 | SKU stock = 5 |
| FLOW-03 | `...FLOW03_ReturnRequestCompletedEvent_HasAtLeastOneHandler` | reflection | tồn tại handler |
| PERF-đúng-sai | `...REPORT_RevenueByMonth_IncludesOrdersPlacedOnLastDayOfMonth` | đơn Completed 2025-03-31 12:00, 2×1000 | tổng T3 ≥ 2000 |
| SEC-02 | `...SEC02_LocalFileStorage_DeleteFileAsync_RejectsPathTraversal` | sandbox tạm, file ngoài wwwroot | file còn nguyên |
| FLOW-01 | `Application.Tests/.../AuditCreateOrderUnexpectedFailureTests` | mock UoW, `CompleteAsync` ném lỗi | `rollbacks + restores > 0` |

Kết quả lần chạy 2026-10-14: 7/7 integration FAIL (đúng kỳ vọng tái hiện), 1/1 unit FAIL. Thông điệp thực tế ở file 13 §0.

## B. Cần viết (chưa có)

| Mã | Test | Dữ liệu / bước | Điều kiện đạt | Trường hợp biên |
|---|---|---|---|---|
| SEC-01 | CI: `gitleaks detect --log-opts="--all"` và `gitleaks protect --staged` | repo | 0 phát hiện (sau rotate/làm sạch) | `*.example.*` phải được allowlist |
| SEC-03 | Test phủ mọi action: quét `[Authorize]` ở controller + gọi ẩn danh các route không `AllowAnonymous` ⇒ 401 | tất cả controller | không route nhạy cảm nào trả 2xx ẩn danh | `UserActivities` (chưa đo), `Cart` (AllowAnonymous có chủ đích), `Search`, `Marquee` |
| SEC-03 | Unit: `AuthorizationBehavior` với request **không** có attribute nhưng handler có | handler mẫu | thiếu quyền ⇒ `ForbiddenAccessException`/`UnauthorizedAccessException` | tương thích với lời gọi nội bộ không có `HttpContext` |
| SEC-04/05 | Integration: refresh với (a) chỉ refresh cookie, (b) refresh cookie hết hạn, (c) token đã revoke (replay ⇒ thu hồi family), (d) UA khác ⇒ thu hồi, (e) CSRF bật: thiếu header ⇒ 403 dù chỉ có `refresh_token` | factory `enableCsrfProtection: true` | đúng mã/hành vi từng nhánh | đồng hồ lệch (UTC), nhiều tab refresh song song (rotation race) |
| DATA-01 | Integration cart: cộng dồn cùng (Product,Color,Size); cập nhật/xóa từng dòng bằng id; `Color=null` & `Size=null` | user đăng nhập | số dòng/số lượng đúng | giá trị null trong unique index; chuyển đổi giỏ khách → user (merge) trùng dòng |
| DATA-01 | Migration test: áp migration lên DB có dữ liệu cũ (SQLite + PostgreSQL) | snapshot dữ liệu giỏ | không mất dòng | PG vs SQLite khác nhau với `NULLS NOT DISTINCT` |
| FLOW-01 | Integration (PostgreSQL thật, Testcontainers/compose): chèn lỗi sau khi trừ kho (interceptor/fake) | SKU stock 5, qty 2 | stock còn 5 sau lỗi; `PromoCode.TimesUsed` không đổi | lỗi DB vs lỗi không-DB; retry mã đơn trùng; 2 đơn đồng thời cuối cùng 1 đơn vị |
| FLOW-02 | Hủy đơn: Pending/Processing, có/không biến thể, gọi hủy 2 lần; xóa đơn Pending | đơn nhiều dòng trộn SKU/không SKU | tồn đúng từng SKU/Product, không cộng đôi | `Cancelled→Cancelled` bị từ chối; đơn đã `Shipped` không hoàn |
| FLOW-03 | RMA: Return/Exchange, đạt/không đạt `QualityCheck`, hoàn tất 1 lần và 2 lần | đơn Delivered, qty 1 của tổng 3 | hoàn kho đúng chính sách, idempotent theo `ReturnRequestId` | trả một phần; SKU vs Product |
| FE-03 | Vitest cho `middleware.ts` (mock `fetch /api/auth/me/profile`) hoặc Playwright | profile `roles:["Customer"]` / `["Admin"]` / `["Staff"]` | Customer ⇒ redirect; Admin ⇒ next | profile 401/403/5xx; cookie hết hạn; `returnUrl` |
| OPS-01 | Script CI: `docker compose build` + `docker compose up` rồi `curl http://localhost:3000/api/health` qua rewrite | `.env.example` đã sửa | 200 qua proxy frontend → backend | build-arg thiếu ⇒ giá trị mặc định compose |
| ARCH-01 | Integration search với `UseElasticsearch=false` | vài sản phẩm | theo quyết định: có kết quả (fallback) hoặc 503 có tài liệu | từ khóa rỗng, ký tự `%`/`_`, dấu tiếng Việt, phân trang |
| PERF | Test giá trị: nhiều đơn rải ngày 1/cuối tháng, ranh giới tháng, trạng thái khác `Completed`; benchmark 100k đơn (đo số truy vấn và RAM) | dữ liệu sinh | số liệu khớp truy vấn tham chiếu; 1 truy vấn SQL | năm nhuận, múi giờ UTC vs địa phương |
| SEC-07 | Integration: khởi động với `Seed:Enabled=false` ⇒ không có user mặc định; bật ⇒ có và `MustChangePassword=true` | factory cấu hình | đúng | môi trường `Production` |
| SEC-02 | Giữ test A (sau khi vá thì xanh) + thêm: `..\\`, đường dẫn tuyệt đối, `%2e%2e`, symlink | sandbox tạm | luôn trong gốc | Windows vs Linux separator |

## C. Quy trình
1. Mỗi PR sửa lỗi phải làm test tương ứng ở mục A/B chuyển xanh và **bỏ trait `AuditRepro`**.
2. Chạy đầy đủ: `dotnet test` toàn solution (baseline đợt 1: Domain 57/57, Application 199/203 với 4 lỗi localization cũ, Phase0 5/5); không được giảm.
3. Những test cần PostgreSQL/Docker/trình duyệt đánh dấu rõ **"không chạy được do môi trường"** nếu thiếu, không tính là đạt.
