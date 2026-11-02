> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KE_HOACH_CAP_NHAT_TAI_LIEU.md`](../reports/KE_HOACH_CAP_NHAT_TAI_LIEU.md).

# 14. Kế Hoạch Sửa Đã Xác Minh (P0 / P1 / P2)

Dựa trên [13-critical-findings-verification.md](13-critical-findings-verification.md). **Thay thế** `11-prioritized-roadmap.md` ở các mục mâu thuẫn. Giai đoạn này **chưa sửa mã**; mỗi mục chỉ bắt đầu sau khi người dùng duyệt. Mỗi bản sửa kèm test ở [15-regression-test-plan.md](15-regression-test-plan.md).

## Hủy / điều chỉnh so với roadmap cũ
| Mục cũ | Quyết định |
|---|---|
| P0-6 đổi `NEXT_PUBLIC_API_URL` sang `localhost` | **HỦY** (sẽ làm hỏng Docker). Thay bằng sửa `.env.example` (P2-5). |
| P0-3 khóa `{CartId, ProductVariantSkuId}` | **SỬA**: khóa `Id` + unique `(CartId, ProductId, Color, Size)` (P0-3 dưới). |
| P0-4 "thêm `CompleteAsync` khi hủy đơn" | **SỬA**: không cần; sửa entity SKU (P0-4). |
| P0-1 "xóa secret khỏi appsettings" | **SỬA**: file đã untracked; việc cần làm là **rotate** + xử lý lịch sử. |
| SEC-02 Critical | Hạ **Low** → P2. |

## P0 — Làm trước khi cho người dùng thật dùng

| # | Mã | Việc | Tệp chính | Công sức | Rủi ro hồi quy |
|---|---|---|---|---|---|
| P0-1 | SEC-01 | **(Người dùng thực hiện)** Rotate: Supabase DB password + ServiceRoleKey, `Jwt.SecretKey`, `Auth.TokenHashSecret`, VNPay `HashSecret`. Rà quyền truy cập repo/nhánh `origin/v0/*`, `backup/*`. Quyết định có `git filter-repo` + force-push hay không. Thêm `gitleaks` vào pre-commit/CI. | Supabase console, secret store của Render | 2–4 giờ | Mất hiệu lực phiên/refresh token; force-push cần phối hợp mọi clone |
| P0-2 | SEC-07 | Seed theo cờ cấu hình `Seed:Enabled` (mặc định `false` ngoài Development/IntegrationTesting); không seed sample data ngoài Development; nếu seed admin thì mật khẩu từ biến môi trường + `MustChangePassword=true`. | `Program.cs:246-247`, `ApplicationDbContextSeed.cs:29-290` | 3 giờ | Integration test mất user seed → phải bật cờ trong `CustomWebApplicationFactory` |
| P0-3 | DATA-01 | Đổi khóa `CartItem`: `Id` (Guid) + unique index `(CartId, ProductId, Color, Size)`; xóa cấu hình trùng lặp trong `ApplicationDbContext.cs:274-300`; `UpdateCartItem`/`RemoveCartItem` nhận id dòng; cập nhật frontend. **Migration** + script chuyển dữ liệu. | `CartItemConfiguration.cs`, `ApplicationDbContext.cs`, `Cart.cs`, 2 handler, FE cart service | 1–1.5 ngày | Đổi PK/migration trên dữ liệu thật; đổi hợp đồng API |
| P0-4 | FLOW-02b | **[ĐÃ HOÀN THÀNH - Phase 1]** Hủy/xóa đơn hoàn tồn đúng SKU (`ProductVariantSkus.RestoreStockAsync`) khi `ProductVariantSkuId` có giá trị; áp dụng cho `OrderStatusChangedEventHandler` và `DeleteOrderCommandHandler`; đảm bảo idempotent. Chi tiết tại [16-remediation-phase-1.md](16-remediation-phase-1.md). | `OrderStatusChangedEventHandler.cs:77-101`, `DeleteOrderCommandHandler.cs:38-46` | 3–4 giờ | Đã kiểm thử 8 integration tests đạt 100% |
| P0-5 | SEC-04 (+SEC-05, SEC-12) | Refresh không cần access token còn hạn; **đồng thời** thêm `refresh_token` vào điều kiện CSRF; `DateTime.Now`→`UtcNow` ở `TokenService.cs:54`. | `RefreshTokenCommandHandler.cs`, `RefreshTokenCommandValidator`, `CsrfValidationMiddleware.cs:40-44`, `TokenService.cs` | 4–6 giờ | Phải làm cùng SEC-05; ảnh hưởng mọi phiên |
| P0-6 | PERF (đúng-sai) | Sửa lọc ngày cuối tháng (`>= start && < nextMonth`), UTC. (Mục tối ưu SQL để P1.) | `GetRevenueByMonthQueryHandler.cs:42-50`, `GetRevenueByCategoryQueryHandler.cs:23-24` | 2 giờ | Số liệu lịch sử đổi |

## P1 — Sprint kế tiếp

| # | Mã | Việc | Ghi chú |
|---|---|---|---|
| P1-1 | SEC-03 | Sửa `AuthorizationBehavior` đọc attribute của handler **hoặc** chuyển lên request; bỏ comment `ProductsController.cs:201`, `UserActivitiesController.cs:12`. Rà các nơi gọi `Send` ngoài HTTP trước khi bật. | Hồi quy cao → chạy đầy đủ integration test; thêm test cho mọi controller |
| P1-2 | FLOW-01 | **[ĐÃ HOÀN THÀNH - Phase 1]** `TransactionBehavior` rollback khi `IAppResult.IsSuccess == false`; `CreateOrderCommandHandler` phục hồi tồn kho và hoàn `PromoCode.TimesUsed` khi có lỗi. Chi tiết tại [16-remediation-phase-1.md](16-remediation-phase-1.md). | Đã kiểm thử unit test và audit repro đạt 100% |
| P1-3 | FLOW-03 | **[ĐÃ HOÀN THÀNH - Phase 1]** `ReturnRequestCompletedEventHandler` hoàn kho theo chính sách (sau `QualityCheck`, idempotent, đúng SKU/Product). Chi tiết tại [16-remediation-phase-1.md](16-remediation-phase-1.md). | Đã kiểm thử 4 integration tests đạt 100% |
| P1-4 | FE-03 | Middleware dashboard kiểm tra role (Admin/Manager hoặc danh sách chốt); thêm kiểm tra phía layout. | Xác nhận role `Staff` |
| P1-5 | PERF | Đẩy `GroupBy/Sum` xuống SQL cho 2 handler báo cáo; 1 truy vấn thay vì 12. | Có benchmark trước/sau |
| P1-6 | ARCH-01 | Chọn: fallback EF `Contains/ILike` trong `NoOpProductSearchService` **hoặc** cập nhật `AGENTS.md`. | Quyết định sản phẩm |
| P1-7 | FE (đợt 1) | Đồng bộ Zod đăng ký với `RegisterCommandValidator` (≥12 ký tự + độ phức tạp); đọc `from` ở trang login. | Chưa xác minh lại trong phase này (xem giới hạn) |

## P2 — Dọn dẹp / dài hạn

| # | Mã | Việc |
|---|---|---|
| P2-1 | SEC-02 | Chặn path traversal trong `FileStorageService.DeleteFileAsync` hoặc xóa lớp chết; gỡ `TestStorageController` khỏi build Release. |
| P2-2 | SEC-09/10/11 (đợt 1) | Bổ sung validator còn thiếu, rate limiting theo endpoint, HSTS/CSP, `healthCheckPath` Render — **cần xác minh lại** trước khi làm. |
| P2-3 | DATA | Unique index có `HasFilter` cho soft-delete, composite index `Orders` — **cần xác minh lại**. |
| P2-4 | TEST | Sửa 4 test localization; thêm test frontend; đưa `AuditRepro` thành test hồi quy thường trực sau khi sửa (bỏ trait). |
| P2-5 | OPS-01 | Sửa `docker-compose/.env.example:57` về `http://backend:5000/api` + ghi chú "chỉ dùng cho rewrites phía server"; chạy `docker compose build` xác nhận. |
| P2-6 | DOC | Cập nhật `AGENTS.md`/`README.md`: provider DB (PostgreSQL/SQLite, không SQL Server), có test, hành vi search 503. |
| P2-7 | FLOW-04 | VNPay Refund API tự động (đợt 1 chưa xác minh lại). |

## Thứ tự phụ thuộc
`P0-5` ↔ `SEC-05` (cùng lúc). `P0-2` trước khi đổi test factory. `P0-3` cần migration → làm trước khi có dữ liệu giỏ hàng thật. `P1-1` sau khi đã có test phủ controller. `P0-1` độc lập, **ưu tiên cao nhất** và do người dùng thực hiện.

## Điều kiện nghiệm thu chung
Mọi test `Category=AuditRepro` tương ứng chuyển **xanh**, bỏ trait; toàn bộ test baseline vẫn đạt; không có secret mới trong `gitleaks`.
