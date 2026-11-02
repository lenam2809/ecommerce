# NHẬT KÝ CẬP NHẬT TÀI LIỆU VÀ BÁO CÁO TỔNG HỢP HỆ THỐNG
## DỰ ÁN SHOPVIET E-COMMERCE PLATFORM (SSoT 2026)

> **Mục tiêu:** Tổng hợp toàn diện chiến dịch rà soát, đồng bộ hóa tài liệu và chuẩn hóa các file mẫu cấu hình dự án ShopViet E-Commerce theo kế hoạch đã phê duyệt, bảo đảm không còn mâu thuẫn hay số liệu trái ngược giữa các tài liệu sống (Loại A) và mã nguồn thực tế.  
> **Thời điểm hoàn thành:** 02/11/2026  
> **Nhánh thực hiện:** `docs/sync-with-code`  
> **Commit mốc đối chiếu:** `38374939afc01336a08c60fd84624479972d3ab0` (nhánh `main`)  
> **Nguyên tắc cốt lõi:** Bám sát hiện trạng mã nguồn thực tế (SSoT 2026), Sửa đổi tối thiểu (Minimal Diff), Bảo vệ file `.gitignore`, Không sửa code nghiệp vụ, Không thực hiện `git push`.

---

## PHẦN 1: DANH SÁCH TOÀN BỘ FILE ĐÃ SỬA KÈM TÓM TẮT THAY ĐỔI

Chiến dịch đồng bộ hóa được triển khai qua 5 nhóm công việc độc lập tương ứng với 5 commit riêng biệt trên nhánh `docs/sync-with-code`, bao quát tổng cộng **85 tệp tin** (trong đó có 28 tệp tài liệu sống Loại A, 6 tệp mẫu cấu hình được phê duyệt, và 51 tệp tài liệu lịch sử Loại B).

### 1.1. Nhóm 1: Cốt lõi Ngữ cảnh AI Assistants
- **Commit ID:** `38f230a2022c3bf3f2cd36e7193dd4966af99650` (ngắn gọn: `38f230a`)
- **Thông điệp commit:** `docs(agents): synchronize assistant contexts with codebase reality`
- **Số lượng thay đổi:** 3 files changed, 333 insertions(+), 32 deletions(-)
- **Danh sách file chi tiết và tóm tắt thay đổi:**
  1. `AGENTS.md` (Thư mục gốc, Tracked):
     - Bổ sung dòng mốc chuẩn đầu trang: `Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493`.
     - Cập nhật số lượng Controller từ 26 thành **36 Controllers**.
     - Đính chính Database: Loại bỏ Microsoft SQL Server; xác nhận hệ thống chỉ hỗ trợ **PostgreSQL** (Docker/Render) và **SQLite** (Local dev).
     - Cập nhật thông số kiểm thử: Đính chính từ "không có test" thành **3 test projects với 55 test files** (`Ecommerce.Application.Tests`, `Ecommerce.Domain.Tests`, `Ecommerce.WebAPI.IntegrationTests`).
     - Bổ sung thông tin CI/CD: Ghi nhận workflow GitHub Actions `frontend-quality.yml`.
     - Cập nhật hạ tầng: Ghi nhận đầy đủ **11 dịch vụ docker-compose** (bổ sung RabbitMQ, Jaeger, Prometheus, Alertmanager, Grafana).
     - Làm rõ cơ chế Auth & Session: Phân định thời hạn JWT payload claim (60 phút) và Cookie trình duyệt `access_token` (15 phút); cơ chế Guest Cart dùng server-side httpOnly cookie `guest_id` 7 ngày lưu trữ trực tiếp tại bảng `Carts` (không dùng Redis cho giỏ hàng).
     - Bổ sung quy chuẩn SSoT 2026: Mạng lưới 45 Showroom, Hotlines 1800 6868/6869, Freeship từ 500.000₫, Cọc COD 10% khi đơn hàng `TotalAmount > 20.000.000₫`, RMA 7 ngày, luồng chuyển trạng thái đơn hàng bắt buộc `Shipped -> Delivered -> Completed`.
     - Bổ sung mục "Sai lệch đã biết" (Known Discrepancies) ghi nhận 5 điểm lệch giữa code và thiết kế.
  2. `CLAUDE.md` (Thư mục gốc, Local-only bị `.gitignore:103` chặn, Staged bằng `git add -f`):
     - Đồng bộ hóa 100% nguyên văn từng dòng với `AGENTS.md`. Lệnh `git diff --no-index AGENTS.md CLAUDE.md` xác nhận độ lệch bằng 0 (0 diff).
  3. `apps/frontend/ecommerce-dashboard/CLAUDE.md` (Local-only bị `.gitignore:103` chặn, Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Đặc tả ngữ cảnh riêng cho Dashboard: Cổng chạy dev 3001, framework Next.js 15 với **React 18.3.1** (lưu ý không dùng React 19), Tailwind CSS v4, TanStack Query v5, TanStack Table v8.
     - Cập nhật danh mục **71 tuyến màn hình** và các phân hệ nghiệp vụ mới (`/inventory`, `/showrooms`, `/returns`, `/account-locks`, `/configs/marquee`, `/configs/product-addons`).
     - Ghi nhận cảnh báo kỹ thuật quan trọng: API service `order-service.ts` gọi cập nhật trạng thái đơn thiếu trường `rowVersion` phục vụ optimistic concurrency.

---

### 1.2. Nhóm 2: Tài liệu Giới thiệu & Cài đặt Hệ thống (Kèm Mẫu cấu hình được duyệt)
- **Commit ID:** `0045a8e5f6df0fcb9f4b79a38c86c99c61ae935d` (ngắn gọn: `0045a8e`)
- **Thông điệp commit:** `docs(readme): update system overview, local setup and design specifications`
- **Số lượng thay đổi:** 9 files changed, 478 insertions(+), 529 deletions(-)
- **Danh sách file chi tiết và tóm tắt thay đổi:**
  1. `README.md` (Thư mục gốc, Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Xóa bỏ toàn bộ hướng dẫn cài đặt và chuỗi kết nối Microsoft SQL Server 2019.
     - Thay thế bằng hướng dẫn thiết lập 2 phương án chuẩn: Phương án 1 chạy hạ tầng đầy đủ qua Docker Compose (`docker compose up -d postgres redis rabbitmq`), Phương án 2 chạy độc lập nhanh với SQLite cục bộ.
     - Cập nhật thông số kiến trúc: 36 Controllers, 67 Entities, 11 dịch vụ Docker, 3 dự án kiểm thử với 55 test files, hướng dẫn chạy lệnh `dotnet test`.
     - Sửa sai lệch trạng thái đơn hàng cũ (`Delivered=3`, `Returned=5`) thành chuỗi 9 trạng thái chuẩn `EOrderStatus`.
     - Bổ sung mục "Sai lệch đã biết" phản ánh trung thực hiện trạng code.
  2. `DESIGN.md` (Thư mục gốc, Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Chuẩn hóa hệ màu phân vai kép (Dual-Accent Tech Hierarchy): Tech Crimson (`#E11D48` / `bg-brand`) cho chuyển đổi/mua hàng; Electric Blue (`#2563EB` ở Light, `#3B82F6` ở Dark / `bg-tech-blue`) cho công nghệ/tương tác/nút thêm vào giỏ.
     - Loại bỏ các mã màu ám hồng/nâu Material Design 3 cũ (`#906f70`, `#5c3f40`).
     - Đồng bộ chuẩn Dark Mode Deep Obsidian 4 tầng bề mặt (`#090D16`, `#111827`, `#182234`, `#1E293B`).
     - Nghiêm cấm hardcode mã màu hex trong JSX/TSX; chuẩn hóa quy chuẩn tiền tệ `.price-tag`.
  3. `apps/backend/Ecommerce/TemplateEngineHost/README.md` (Tạo mới, Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Giải thích bản chất kỹ thuật: Thư mục này chỉ là cache của Visual Studio template engine (`vs/templatecache.json`), không phải Razor email engine. Email thực tế sử dụng static HTML templates tại `Ecommerce.Infrastructure/EmailTemplates/*.html` qua `EmailBackgroundService.cs`.
  4. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.example.json` (Tracked):
     - Đổi chuỗi kết nối mẫu từ SQL Server sang PostgreSQL và SQLite.
     - Đồng bộ tên thuộc tính JWT khớp với `JwtConfig.cs`: đổi `Key` thành `SecretKey`, đổi `AccessTokenExpiryMinutes` thành `AccessTokenExpirationMinutes`, bổ sung `Issuer` và `Audience`.
     - Bổ sung khối cấu hình `CookieSettings` (15 phút access token, 7 ngày refresh token) và khối `VnPay` mẫu. Loại bỏ cấu hình thừa Stripe.
     - Thay thế toàn bộ giá trị nhạy cảm bằng placeholder chuẩn (`CHANGE_ME_MINIMUM_32_CHARACTERS`, `your_vnpay_tmn_code`).
  5. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.example.json` (Tracked):
     - Đồng bộ chuỗi kết nối SQLite mẫu (`Data Source=ecommerce.db`), chuẩn hóa key JWT và thêm khối `VnPay`.
  6. `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Production.example.json` (Tracked):
     - Đồng bộ chuỗi kết nối PostgreSQL mẫu, chuẩn hóa key JWT, khối `VnPay` và token hash secret dạng placeholder.
  7. `docker-compose/.env.example` (Tracked):
     - Bổ sung biến môi trường cho 4 dịch vụ giám sát: `JAEGER_UI_PORT`, `PROMETHEUS_PORT`, `ALERTMANAGER_PORT`, `GRAFANA_PORT`.
     - Chuẩn hóa biến kết nối PostgreSQL, Redis, RabbitMQ và Elasticsearch.
  8. `apps/frontend/ecommerce-client/.env.example` (Local-only bị `.gitignore` chặn, Staged bằng `git add -f`):
     - Chuẩn hóa cấu hình mẫu phía Client: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`, placeholder `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
  9. `apps/frontend/ecommerce-dashboard/.env.example` (Local-only bị `.gitignore` chặn, Staged bằng `git add -f`):
     - Chuẩn hóa cấu hình mẫu phía Dashboard: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.

---

### 1.3. Nhóm 3: Phân hệ Khách hàng (`ecommerce-client`)
- **Commit ID:** `0835a2a11b6ff3424d9c0e5a049d5bf1e443ce71` (ngắn gọn: `0835a2a`)
- **Thông điệp commit:** `docs(client): update client architecture, business analysis and test checklist`
- **Số lượng thay đổi:** 3 files changed, 557 insertions(+), 194 deletions(-)
- **Danh sách file chi tiết và tóm tắt thay đổi:**
  1. `apps/frontend/ecommerce-client/README.md` (Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Viết lại toàn diện tài liệu thay thế template mặc định sơ khai của Next.js: Next.js 15 App Router, React 19, Tailwind CSS v4, TanStack Query v5, Zod, React Hook Form, SignalR Hubs (`NotificationHub`, `ReviewHub`).
     - Bảng kê chi tiết **27 tuyến routes giao diện** chia theo 5 cụm nghiệp vụ.
     - Đặc tả cơ chế giỏ hàng khách (Guest Cart) qua cookie `guest_id` 7 ngày và bảng `Carts`, quy trình sáp nhập giỏ (cart merge) khi đăng nhập.
     - Hướng dẫn thiết lập, danh mục scripts (`dev`, `build`, `lint`, `typecheck`), cổng chạy 3000.
  2. `apps/frontend/ecommerce-client/docs/business-analysis.md` (Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Xóa bỏ triệt để các nhận định sai lệch lịch sử (bỏ câu "Admin Dashboard và Payment Gateway là out-of-scope", bỏ câu "Token lưu song song Cookie & LocalStorage").
     - Chuẩn hóa bảng trạng thái đơn hàng thành đầy đủ **9 trạng thái của Domain `EOrderStatus`**, mô tả quy tắc chuyển đổi trạng thái không nhảy cóc từ `Shipped` sang `Completed`.
     - Bổ sung đặc tả 4 Use Case công nghệ mới: UC1 Checkout cọc COD 10% khi đơn > 20 triệu; UC2 Đổi trả hàng RMA 7 ngày; UC3 So sánh thông số kỹ thuật `/compare`; UC4 Mua kèm Add-Ons bảo hành mở rộng & phụ kiện.
     - Bổ sung sơ đồ Mermaid liên kết thực thể (`ReturnRequest`, `Showroom`, `ProductAddOn`) và mục "Sai lệch đã biết".
  3. `docs/frontend-manual-test-checklist.md` (Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Mở rộng toàn diện kịch bản kiểm thử:
       + **15 ca kiểm thử Storefront Client (CL-01 đến CL-15):** Bao phủ 27 routes, tập trung vào RMA 7 ngày, Cọc COD 10%, VNPay return callback, So sánh thông số `/compare`, O2O Showroom Pickup, Gói Add-Ons, Guest cart, Cart merge, định dạng tiền tệ `.price-tag`.
       + **11 ca kiểm thử Quản trị Dashboard (DB-01 đến DB-11):** Bao phủ Quản lý kho IMEI/Serial (`/inventory`), Xử lý yêu cầu RMA kỹ thuật (`/returns`), Quản trị 45 showroom (`/showrooms`), Cấu hình Marquee (`/configs/marquee`), Khóa tài khoản (`/account-locks`), Concurrency đơn hàng kèm `rowVersion`, SignalR realtime.
       + Bổ sung Bảng kiểm tra Tính nhất quán Toàn hệ thống (Cross-System Consistency Matrix).

---

### 1.4. Nhóm 4: Phân hệ Quản trị & Kiến trúc Kỹ thuật (`ecommerce-dashboard` & `docs/`)
- **Commit ID:** `1169a03ab8703aa688710b4be4ea4fb2116f3abb` (ngắn gọn: `1169a03`)
- **Thông điệp commit:** `docs(dashboard-arch): update admin dashboard docs and backend architecture specifications`
- **Số lượng thay đổi:** 19 files changed, 5899 insertions(+), 255 deletions(-)
- **Danh sách file chi tiết và tóm tắt thay đổi:**
  1. `apps/frontend/ecommerce-dashboard/README.md` (Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Đặc tả kiến trúc kỹ thuật: Next.js 15, **React 18.3.1**, Tailwind CSS v4, TanStack Query v5, TanStack Table v8, `@dnd-kit`, Recharts. Chạy dev trên cổng 3001.
     - Bảng kê chi tiết toàn bộ **71 tuyến routes quản trị**.
     - Hướng dẫn vận hành các phân hệ mới: Quản lý kho IMEI/Serial (`/inventory`), Showroom O2O (`/showrooms`), Xử lý RMA (`/returns`), Khóa tài khoản (`/account-locks`), Marquee (`/configs/marquee`), Bulk CSV (`/bulk-management/products`).
     - Ghi nhận cảnh báo `order-service.ts` thiếu `rowVersion`.
  2. `apps/frontend/ecommerce-dashboard/docs/ui-style-guide.md` (Tracked):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Chuẩn hóa Design System theo SSoT 2026: Dual-Accent (Crimson & Tech Blue), Dark Mode Deep Obsidian 4 lớp bề mặt, định dạng tiền tệ `.price-tag`.
     - Bổ sung đặc tả UI cho badge 9 trạng thái đơn hàng và stepper 5 bước RMA kỹ thuật.
  3. `docs/architecture-backend.md` (Local-only bị `.gitignore` chặn, Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Khớp đầy đủ 36 controllers, 67 entities, 20 enums số nguyên, 6 migrations, 3 test projects với 55 test files.
     - Đặc tả Clean Architecture + DDD + CQRS, Outbox Pattern cho Domain Events, SignalR Notification & Review hubs.
     - Làm rõ kiến trúc Guest Cart qua cookie server `guest_id` 7 ngày và bảng `Carts` (không dùng Redis).
     - Bổ sung sơ đồ khối và mục "Sai lệch đã biết" chi tiết.
  4. `docs/docker-compose-services/README.md` (Local-only bị `.gitignore` chặn, Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Đồng bộ bảng tổng hợp và sơ đồ kiến trúc khớp đúng **11 dịch vụ Docker Compose** (bổ sung RabbitMQ, Jaeger, Prometheus, Alertmanager, Grafana).
  5-15. `docs/docker-compose-services/01-postgres.md` đến `11-rabbitmq.md` (11 files, Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493` cho toàn bộ 11 file.
     - Khớp chi tiết cấu hình container, cổng mạng, biến môi trường, cơ chế healthcheck và volume mount.
     - Tạo mới tệp `11-rabbitmq.md` đặc tả dịch vụ RabbitMQ 3-management-alpine (cổng 5672 và UI 15672).
  16. `docs/backend-sync/01-backend-gap-and-schema-spec.md` (Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Đồng bộ schema thực tế 2026: `ProductVariantSkus`, `InventoryItems`, `ReturnRequests`, `Showrooms`, `ShowroomInventories`, `ProductSpecifications`, `ProductAddOns`.
  17. `docs/backend-sync/02-database-migration-report.md` (Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Phản ánh chuỗi 6 migrations thực tế từ `20260507115052_InitialCreate.cs` đến `20261021121358_AddTechEcommerceSpecsAndShowrooms2026.cs`.
  18. `docs/backend-sync/03-fullstack-alignment-report.md` (Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Đối soát toàn diện các tính năng fullstack: Giỏ hàng, Cọc COD 10%, RMA 7 ngày, Showroom O2O, Add-Ons.
  19. `docs/backend-sync/05-admin-dashboard-sync-plan.md` (Staged bằng `git add -f`):
     - Cập nhật dòng mốc chuẩn đầu trang đối chiếu commit `3837493`.
     - Ghi nhận trạng thái hoàn tất 100% việc đồng bộ 71 routes giao diện dashboard.

---

### 1.5. Nhóm 5: Đóng gói Lưu trữ Tài liệu Lịch sử (Loại B)
- **Commit ID:** `1aafd66874bf842d604daa70b24004d006b20610` (ngắn gọn: `1aafd66`)
- **Thông điệp commit:** `docs(archive): attach archival banners to historical audit and proposal documents`
- **Số lượng thay đổi:** 51 files changed, 6633 insertions(+), 0 deletions(-)
- **Cơ chế thực thi & Kiểm chứng byte-level:**
  - Áp dụng cơ chế đọc/ghi nhị phân (`rb`/`wb`), tự động nhận diện ký tự ngắt dòng gốc (`\n` hoặc `\r\n`) của từng tệp.
  - Chèn banner chuẩn lưu trữ tại Dòng 1:
    `> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm <ngày gốc>, không còn là hiện trạng. Xem tài liệu hiện hành: <link>.`
  - Tạo một dòng trống phân cách hoàn chỉnh tại Dòng 2.
  - Bảo toàn 100% nội dung gốc bên dưới từ Dòng 3 trở đi, không làm biến dạng hay thay đổi dù chỉ một byte (kể cả tệp có chứa byte phi UTF-8 `dashboard_review_report.md`).
  - Đã bỏ qua tệp `apps/frontend/ecommerce-client/docs/design-system-proposal.md` do không tồn tại trên đĩa theo đúng chỉ dẫn của kế hoạch.
- **Phân loại danh sách 51 tệp Loại B đã đóng gói:**
  - *Chuỗi hồ sơ Kiểm toán Kiến trúc Giai đoạn 2 (20 tệp):* `docs/architecture-audit/00-executive-summary.md` đến `28-remediation-master-completion.md`.
  - *Báo cáo Đợt Kiểm thử QA Mega Lịch sử (3 tệp):* `docs/backend-sync/06-mega-qa-phase1-static-security.md`, `07-mega-qa-phase2-e2e-loops.md`, `08-mega-qa-phase3-final-acceptance.md`.
  - *Hồ sơ Triển khai Redesign Giai đoạn 3 (7 tệp):* `docs/ui-redesign/01-current-state-inventory.md`, `02-ui-ux-audit-report.md`, `04-stitch-execution-plan.md`, `05-stitch-review-handover.md`, `06-implementation-verification-report.md`, `06-integration-test-results.md`, `07-performance-a11y-audit.md`.
  - *Báo cáo Đối soát Mâu thuẫn (1 tệp):* `docs/reports/BAO_CAO_MAU_THUAN.md`.
  - *Các tài liệu Thiết kế & Kiểm toán Cũ tại thư mục `docs/` (11 tệp):* `architecture-overview.md`, `authentication_proposal.md`, `backend-frontend-deep-dive.md`, `caching-strategy.md`, `elasticsearch-setup.md`, `frontend-improvement-progress.md`, `frontend-improvement-summary.md`, `improvement-progress.md`, `security-audit.md`, `shopviet_architecture_improvement_report.md`, `ui-ux-redesign.md`.
  - *Báo cáo Bảo mật Backend Cũ (1 tệp):* `apps/backend/Ecommerce/docs/backend_security_review.md`.
  - *Đề xuất & Báo cáo Review Cũ phía Client (4 tệp):* `apps/frontend/ecommerce-client/docs/lazy-login-proposal.md`, `ui-ux-review-report.md`, `ui_ux_review_dark_mode.md`.
  - *Kế hoạch Tái cấu trúc & Review Cũ phía Dashboard (2 tệp):* `apps/frontend/ecommerce-dashboard/docs/dashboard_review_report.md`, `ui-refactor-plan.md`.

---

### 1.6. Bảng Tổng hợp Commit trên Nhánh `docs/sync-with-code`

| Commit Hash | Nhóm thực hiện | Thông điệp Commit | Files Changed | Insertions | Deletions | Trạng thái Git |
|---|---|---|:---:|:---:|:---:|:---:|
| `38f230a` | **Nhóm 1** (AI Context) | `docs(agents): synchronize assistant contexts with codebase reality` | 3 | 333 | 32 | Clean |
| `0045a8e` | **Nhóm 2** (Setup & Config) | `docs(readme): update system overview, local setup and design specifications` | 9 | 478 | 529 | Clean |
| `0835a2a` | **Nhóm 3** (Client & QA) | `docs(client): update client architecture, business analysis and test checklist` | 3 | 557 | 194 | Clean |
| `1169a03` | **Nhóm 4** (Dashboard & Arch)| `docs(dashboard-arch): update admin dashboard docs and backend architecture specifications`| 19 | 5899 | 255 | Clean |
| `1aafd66` | **Nhóm 5** (Archived Docs) | `docs(archive): attach archival banners to historical audit and proposal documents` | 51 | 6633 | 0 | Clean |
| **Tổng cộng** | **Cả 5 Nhóm** | **Đồng bộ hóa toàn diện hệ thống tài liệu ShopViet E-Commerce** | **85** | **13.900** | **1.010** | **Clean** |

---

## PHẦN 2: DANH SÁCH "SAI LỆCH ĐÃ BIẾT" (KNOWN DISCREPANCIES)

Tất cả các điểm sai lệch giữa mã nguồn đang chạy và chủ ý thiết kế/tiếp thị đã được kiểm chứng độc lập trên codebase và ghi nhận minh bạch vào mục "Sai lệch đã biết" của các tài liệu liên quan mà **không can thiệp sửa mã nguồn logic**, tuân thủ nghiêm ngặt Integrity Mandate:

### 2.1. Chênh lệch Logic Điều kiện Biên Freeship 500.000₫
- **Vị trí mã nguồn:**
  - Backend: `apps/backend/Ecommerce/Ecommerce.Application/Services/ShippingCalculator.cs` dòng 34:
    ```csharp
    if (subtotal > FREE_SHIPPING_THRESHOLD) // Hằng số FREE_SHIPPING_THRESHOLD = 500_000m
    {
        return 0m;
    }
    ```
  - Frontend Client: `components/cart/CartHeader.tsx:16`, `components/cart/OrderSummary.tsx:51`, `app/(routes)/checkout/page.tsx:105`:
    ```typescript
    const isFreeShipping = subtotal >= 500000;
    ```
- **Hành vi thực tế:** Backend dùng toán tử so sánh lớn hơn hẳn (`>`). Do đó, nếu đơn hàng có tổng tiền đúng bằng **500.000₫**, backend vẫn tính phí vận chuyển 30.000₫. Trong khi đó, Frontend hiển thị thông báo khách hàng đã đạt điều kiện Freeship (áp dụng khi `>= 500.000₫`).
- **Phản ánh trong tài liệu:** Được ghi nhận rõ tại `AGENTS.md`, `README.md`, `ecommerce-client/docs/business-analysis.md`, `docs/architecture-backend.md`, và checklist `frontend-manual-test-checklist.md` (CL-02).

### 2.2. Chênh lệch Thời hạn Phiên đăng nhập giữa Cookie và JWT Claim
- **Vị trí mã nguồn:**
  - JWT Claim: `apps/backend/Ecommerce/Ecommerce.Infrastructure/Services/TokenService.cs` dòng 54:
    ```csharp
    Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.AccessTokenExpirationMinutes) // Giá trị cấu hình là 60 phút
    ```
  - Browser Cookie: `apps/backend/Ecommerce/Ecommerce.WebAPI/Extensions/CookieAuthExtensions.cs` dòng 36:
    ```csharp
    Expires = DateTimeOffset.UtcNow.AddMinutes(cookieSettings.AccessTokenMinutes) // Fallback mặc định là 15 phút
    ```
- **Hành vi thực tế:** Payload claim của JWT token sinh ra thời hạn 60 phút, tuy nhiên cookie `access_token` gửi về trình duyệt chỉ có thời hạn 15 phút. Trình duyệt người dùng sẽ tự động thu hồi và xóa cookie sau 15 phút dù JWT bên trong còn 45 phút hiệu lực. Refresh token sống 7 ngày.
- **Phản ánh trong tài liệu:** Đã ghi nhận chính xác hành vi này tại `AGENTS.md`, `CLAUDE.md`, `README.md`, `business-analysis.md`, và `architecture-backend.md`.

### 2.3. Hiện trạng Tích hợp Cổng thanh toán (Gateways)
- **Vị trí mã nguồn:**
  - Backend: `apps/backend/Ecommerce/Ecommerce.WebAPI/Controllers/PaymentsController.cs` và `VnPayPaymentGateway.cs`.
  - Frontend: `apps/frontend/ecommerce-client/components/checkout/payment-method.tsx`.
- **Hành vi thực tế:**
  - Backend chỉ tích hợp bộ xử lý thực tế trọn vẹn (tạo URL, mã hóa checksum SHA512, tiếp nhận IPN callback, xác thực chữ ký số) cho **COD** và **VNPay Sandbox**.
  - Frontend Client hiển thị 6 lựa chọn thanh toán (VNPay, VietQR Pro, Ví MoMo, Ví ZaloPay, Thẻ tín dụng quốc tế, COD). Khi người dùng chọn VietQR, MoMo hoặc ZaloPay, hệ thống chỉ lưu chuỗi tên phương thức vào database chứ backend chưa có webhook hay SDK tích hợp đối soát thanh toán thực tế.
- **Phản ánh trong tài liệu:** Được phân định rõ ràng giữa "Cổng đã tích hợp thực tế" (COD, VNPay) và "Cổng mới dừng ở mức UI mô phỏng" trong toàn bộ tài liệu sống.

### 2.4. Bí mật Cấu hình cũ lộ trong Lịch sử Git (Git History Leak)
- **Vị trí mã nguồn:**
  - Commit `695e86f84c15` (ngày 01/04/2026): Từng commit trực tiếp tệp `appsettings.json` chứa `VnPay:HashSecret`, `VnPay:TmnCode` và chuỗi kết nối cơ sở dữ liệu.
  - Commit `0b346f35aaf0` (ngày 08/04/2026): Đã xóa các file này khỏi git tracking và đưa vào `.gitignore:101`.
- **Hành vi thực tế:** Dù file không còn trong working tree hiện tại, các secret sandbox cũ vẫn tồn tại nguyên vẹn trong git object database của lịch sử commit.
- **Phản ánh trong tài liệu:** Đã ghi nhận cảnh báo an ninh P0 vào `AGENTS.md`, `README.md`, `architecture-backend.md`.

### 2.5. Lệch pha Enum `OrderStatus` tại Client Storefront
- **Vị trí mã nguồn:**
  - Backend: `apps/backend/Ecommerce/Ecommerce.Domain/Enums/EOrderStatus.cs`:
    Gồm 9 trạng thái: `Pending=0`, `Processing=1`, `Shipped=2`, `Completed=3`, `Cancelled=4`, `Refunded=5`, `Delivered=6`, `ReturnRequested=7`, `Returned=8`.
  - Client: `apps/frontend/ecommerce-client/types/order.ts` dòng 150-157:
    Chỉ định nghĩa 6 trạng thái: `Pending=0`, `Processing=1`, `Shipped=2`, `Delivered=3`, `Cancelled=4`, `Returned=5`.
- **Hành vi thực tế:** Client gán sai giá trị số `Delivered = 3` (trong khi backend `Completed = 3` và `Delivered = 6`), đồng thời thiếu trạng thái `Completed` và `Refunded`. Dashboard quản trị đã định nghĩa đúng 9 trạng thái.
- **Phản ánh trong tài liệu:** Ghi nhận rõ rệt tại `AGENTS.md`, `business-analysis.md`, `frontend-manual-test-checklist.md`.

### 2.6. Dashboard Cập nhật Trạng thái Đơn hàng Thiếu `RowVersion`
- **Vị trí mã nguồn:**
  - Backend: `apps/backend/Ecommerce/Ecommerce.Application/Orders/Commands/UpdateOrderStatus/UpdateOrderStatusCommand.cs` dòng 14:
    ```csharp
    public required string RowVersion { get; set; }
    ```
  - Dashboard: `apps/frontend/ecommerce-dashboard/services/order-service.ts` dòng 23:
    Gửi payload chỉ gồm `{ status, expectedDeliveryDate }`, thiếu trường `rowVersion`.
- **Hành vi thực tế:** Backend thiết kế cơ chế Optimistic Concurrency Control thông qua `RowVersion` để ngăn chặn xung đột ghi đồng thời, nhưng Dashboard client hiện chưa đọc và gửi kèm giá trị này.
- **Phản ánh trong tài liệu:** Được ghi nhận tại `apps/frontend/ecommerce-dashboard/README.md`, `CLAUDE.md` của dashboard và `architecture-backend.md`.

### 2.7. Mâu thuẫn Thời hạn Đổi trả hàng giữa Code Nghiệp vụ và Marketing
- **Vị trí mã nguồn:**
  - Code Backend: `apps/backend/Ecommerce/Ecommerce.Application/Returns/Commands/CreateReturnRequest/CreateReturnRequestCommandHandler.cs` dòng 61-64:
    ```csharp
    if ((DateTime.UtcNow - deliveredDate).TotalDays > 7)
    {
        return Result<Guid>.Failure("Đã quá hạn đổi/trả 7 ngày kể từ ngày nhận hàng.");
    }
    ```
  - Dữ liệu Seed FAQ: `ApplicationDbContextSeed.cs:3150` và giao diện `apps/frontend/ecommerce-client/app/(routes)/account/returns/page.tsx:45-56`: Quảng bá chính sách "30 ngày 1 đổi 1".
- **Hành vi thực tế:** Backend kiểm tra nghiêm ngặt giới hạn 7 ngày kể từ ngày giao hàng thành công (`Delivered`). Nếu khách hàng gửi yêu cầu vào ngày thứ 8, hệ thống sẽ từ chối ngay lập tức. Con số "15 phút" ở một số tài liệu cũ thực chất là cam kết thời gian đổi máy tại showroom ("Đổi máy mới trong 15 phút tại 45 Showroom").
- **Phản ánh trong tài liệu:** Thống nhất chuẩn nghiệp vụ theo code là **7 ngày**, ghi nhận điểm lệch quảng bá của marketing vào danh mục chờ quyết định.

---

## PHẦN 3: DANH SÁCH "CẦN XÁC NHẬN" (ITEMS NEEDING CONFIRMATION / DECISIONS)

Dưới đây là 4 quyết định nghiệp vụ và giải pháp kỹ thuật cần Chủ dự án (Project Owner) và Tech Lead phê duyệt chính thức để đưa vào kế hoạch phát triển (Sprint tới):

| STT | Vấn đề cần xác nhận | Phương án lựa chọn | Tác động kỹ thuật & nghiệp vụ | Đề xuất khuyến nghị |
|:---:|---|---|---|---|
| 1 | **Chuẩn hóa Thời hạn Sống của Phiên đăng nhập** | **PA 1:** Chuẩn hóa về **15 phút**.<br>**PA 2:** Chuẩn hóa về **60 phút**. | - PA 1: An toàn tối đa cho e-commerce tài chính; cần cơ chế silent refresh token trơn tru.<br>- PA 2: Giảm tần suất gọi refresh token, nâng cao trải nghiệm người dùng lướt web. | **Chọn PA 1 (15 phút):** Sửa `JwtConfig.AccessTokenExpirationMinutes = 15` để khớp với cookie trình duyệt, duy trì refresh token 7 ngày. |
| 2 | **Thống nhất Chính sách Thời hạn Đổi trả hàng (RMA)** | **PA 1:** Giữ nguyên **7 ngày** theo code.<br>**PA 2:** Mở rộng thành **30 ngày** theo marketing. | - PA 1: Phù hợp tiêu chuẩn bảo hành hàng công nghệ cao (lỗi kỹ thuật 1 đổi 1 trong 7 ngày, sau 7 ngày chuyển bảo hành hãng). Cần sửa text FAQ và footer.<br>- PA 2: Cần sửa handler `TotalDays > 30` và cập nhật lại bộ unit test. | **Chọn PA 1 (7 ngày):** Giữ nguyên logic backend 7 ngày; hiệu chỉnh lại toàn bộ thông điệp tiếp thị và banner client cho đồng bộ. |
| 3 | **Xử lý Bảo mật P0: Đổi Key VNPay Sandbox & Xóa Git History** | **Bước 1:** Cấp lại Sandbox Key.<br>**Bước 2:** Chạy `git filter-repo`. | Loại trừ triệt để nguy cơ lộ lọt credential khi công khai mã nguồn hoặc bàn giao dự án. | **Thực hiện ngay:** Đổi cặp key VNPay Sandbox mới, đưa vào secret manager và lên lịch dùng `git filter-repo` làm sạch git history. |
| 4 | **Bổ sung `JsonStringEnumConverter` cho Backend API** | Thêm converter chuỗi cho System.Text.Json tại `Program.cs`. | API trả về chuỗi trực quan (`"Delivered"`, `"Completed"`) thay vì số nguyên (`6`, `3`), triệt tiêu vĩnh viễn rủi ro lệch mapping index giữa backend và frontend. | **Phê duyệt triển khai:** Bổ sung `options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter())` trong đợt cập nhật backend tới. |

---

## PHẦN 4: CÁC CHỨC NĂNG CÓ TRONG CODE NHƯNG CHƯA ĐƯỢC TÀI LIỆU MÔ TẢ

Trong đợt cập nhật này, **8 chức năng công nghệ quan trọng** đã có mã nguồn hoạt động hoàn chỉnh từ trước nhưng thiếu tài liệu mô tả đã được rà soát, hệ thống hóa và bổ sung đầy đủ vào các tài liệu sống tương ứng:

```
┌────────────────────────────────────────────────────────────────────────┐
│             8 TÍNH NĂNG CÔNG NGHỆ MỚI ĐÃ ĐƯỢC BỔ SUNG ĐẶC TẢ            │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. Quản lý Kho IMEI/Serial Number │ 5. Thanh cuộn Marquee Khẩn cấp     │
│ 2. Quy trình Đổi trả hàng RMA     │ 6. Phụ kiện Mua kèm (Product AddOn)│
│ 3. 45 Showroom & Chuyển kho O2O   │ 7. So sánh Thông số Kỹ thuật       │
│ 4. Khóa Tài khoản Vi phạm         │ 8. Mẫu CSV Quản trị Hàng loạt      │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 4.1. Quản lý Kho IMEI/Serial Number
- **Thành phần mã nguồn:** `InventoryController.cs`, `InventoryItem.cs`, `EInventoryStatus.cs`, `ProductVariantSku.cs`, tuyến giao diện `/inventory` tại dashboard.
- **Nghiệp vụ thực tế:** Quản lý từng thiết bị công nghệ theo mã IMEI/Serial cá thể hóa; hỗ trợ import danh sách IMEI hàng loạt qua file text/csv; theo dõi vòng đời trạng thái (`Available` $\rightarrow$ `Reserved` khi đặt hàng $\rightarrow$ `Sold` khi giao hàng thành công, hoặc `ReturnedToStock` khi đổi trả).
- **Tài liệu đã cập nhật:** `docs/architecture-backend.md` (Mục 5.5), `apps/frontend/ecommerce-dashboard/README.md` (Mục Route `/inventory`), `docs/backend-sync/01-backend-gap-and-schema-spec.md`.

### 4.2. Quy trình Đổi trả hàng (RMA)
- **Thành phần mã nguồn:** `ReturnsController.cs`, `ReturnRequest.cs`, `ReturnEvidence.cs`, `EReturnStatus.cs` (9 trạng thái), `CreateReturnRequestCommandHandler.cs`, giao diện client `/account/returns` và dashboard `/returns`.
- **Nghiệp vụ thực tế:** Khách hàng tạo yêu cầu đổi trả cho đơn hàng đã giao (`Delivered`) trong vòng 7 ngày kèm ảnh/video bằng chứng; Admin xét duyệt, phân công kỹ thuật kiểm tra và kích hoạt hoàn tiền hoặc đổi máy mới.
- **Tài liệu đã cập nhật:** `apps/frontend/ecommerce-client/docs/business-analysis.md` (Use case RMA, quy định 7 ngày, sơ đồ thực thể), `docs/architecture-backend.md`, `apps/frontend/ecommerce-dashboard/README.md`, `docs/frontend-manual-test-checklist.md` (CL-05, DB-04).

### 4.3. Mạng lưới 45 Showroom & Điều chuyển kho O2O
- **Thành phần mã nguồn:** `ShowroomsController.cs`, `Showroom.cs`, `ShowroomInventory.cs`, bộ dữ liệu seed 45 showroom toàn quốc theo SSoT 2026, hotlines 1800 6868/6869.
- **Nghiệp vụ thực tế:** Cho phép khách hàng tìm showroom gần nhất, chọn hình thức "Nhận hàng tại Showroom" (`ShowroomPickup`), tra cứu tồn kho tức thời của từng chi nhánh.
- **Tài liệu đã cập nhật:** `AGENTS.md`, `README.md`, `apps/frontend/ecommerce-client/README.md`, `apps/frontend/ecommerce-dashboard/README.md`, `docs/architecture-backend.md`.

### 4.4. Khóa & Quản lý Tài khoản Vi phạm (Account Locks)
- **Thành phần mã nguồn:** `AccountLocksController.cs`, `AccountLock.cs`, `AccountLockMiddleware.cs`, `ELockType.cs` (`Temporary`, `Permanent`, `Suspended`), giao diện dashboard `/account-locks`.
- **Nghiệp vụ thực tế:** Quản trị viên có thể khóa tài khoản có hành vi gian lận (spam đơn hàng, đánh giá phá hoại); middleware kiểm tra và chặn truy cập ngay tại tầng HTTP pipeline với mã lỗi 403 Forbidden kèm lý do khóa.
- **Tài liệu đã cập nhật:** `docs/architecture-backend.md`, `apps/frontend/ecommerce-dashboard/README.md`, `docs/frontend-manual-test-checklist.md` (DB-08).

### 4.5. Thanh cuộn Tin tức Khẩn cấp / Khuyến mãi (Marquee)
- **Thành phần mã nguồn:** `MarqueeController.cs`, `MarqueeAdminController.cs`, `MarqueeMessage.cs`, `MarqueeSetting.cs`, giao diện dashboard `/configs/marquee`.
- **Nghiệp vụ thực tế:** Cho phép quản trị viên cấu hình thông điệp tin tức chạy ngang đầu trang Storefront với các mức độ ưu tiên, tốc độ cuộn, màu sắc và thời gian áp dụng.
- **Tài liệu đã cập nhật:** `apps/frontend/ecommerce-dashboard/README.md`, `apps/frontend/ecommerce-dashboard/CLAUDE.md`, `docs/frontend-manual-test-checklist.md` (DB-07).

### 4.6. Gói Phụ kiện & Bảo hành mua kèm (Product Add-Ons)
- **Thành phần mã nguồn:** `ProductAddOnsController.cs`, `ProductAddOn.cs`, trường `CartItem.AddOnId`, tích hợp trên PDP, Cart và Checkout.
- **Nghiệp vụ thực tế:** Bán kèm các gói dịch vụ gia tăng (Bảo hành VIP 1 đổi 1 trong 24 tháng, Combo dán màn hình + ốp lưng, củ sạc nhanh) trực tiếp khi khách hàng chọn mua sản phẩm chính.
- **Tài liệu đã cập nhật:** `apps/frontend/ecommerce-client/docs/business-analysis.md`, `apps/frontend/ecommerce-client/README.md`, `docs/architecture-backend.md`, `docs/frontend-manual-test-checklist.md` (CL-07).

### 4.7. So sánh Chi tiết Thông số Kỹ thuật (`/compare`)
- **Thành phần mã nguồn:** `ProductSpecsController.cs`, `ProductSpecification.cs`, `ProductSpecHelper.cs`, tuyến giao diện `/compare`.
- **Nghiệp vụ thực tế:** Cho phép chọn từ 2 đến 4 thiết bị công nghệ cùng ngành hàng để so sánh trực quan theo ma trận bảng thông số; tự động highlight các thông số vượt trội và lọc xem chỉ những điểm khác biệt.
- **Tài liệu đã cập nhật:** `apps/frontend/ecommerce-client/README.md`, `apps/frontend/ecommerce-client/docs/business-analysis.md`, `docs/frontend-manual-test-checklist.md` (CL-06).

### 4.8. Mẫu CSV Xuất/Nhập Dữ liệu Sản phẩm (Bulk Management)
- **Thành phần mã nguồn:** Endpoint `/api/products/export-template?format=csv` tại `ProductsController.cs`, route giao diện dashboard `/bulk-management/products`.
- **Nghiệp vụ thực tế:** Hỗ trợ quản trị viên tải tệp CSV mẫu chuẩn, chỉnh sửa hàng loạt thông tin sản phẩm công nghệ (tên, giá, SKU, thông số) và upload import trực tiếp vào hệ thống.
- **Tài liệu đã cập nhật:** `apps/frontend/ecommerce-dashboard/README.md`.

---

## PHẦN 5: DANH SÁCH CÁC FILE CHỈ CÓ Ở LOCAL VÀ KHÔNG NẰM TRONG COMMIT

Theo nguyên tắc an toàn thông tin và quy chuẩn cấu trúc dự án, bảng dưới đây giải trình chi tiết tình trạng theo dõi Git đối với toàn bộ các tệp và thư mục đang chỉ lưu trữ tại local:

| STT | Đường dẫn Tập tin / Thư mục | Trạng thái Git | Lý do Không nằm trong Commit | Giải pháp Thay thế trong Repository |
|:---:|---|:---:|---|---|
| 1 | `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.json` | Local-only (Ignored) | Bị `.gitignore:101` chặn. Chứa chuỗi kết nối local dev và secret chạy thật. | Đã có `appsettings.example.json` chuẩn hóa placeholder tại Nhóm 2. |
| 2 | `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.json` | Local-only (Ignored) | Bị `.gitignore:101` chặn. Chứa chuỗi kết nối dev SQLite/Postgres thật. | Đã có `appsettings.Development.example.json` tại Nhóm 2. |
| 3 | `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Production.json` | Local-only (Ignored) | Bị `.gitignore:101` chặn. Chứa cấu hình môi trường production. | Đã có `appsettings.Production.example.json` tại Nhóm 2. |
| 4 | `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Staging.json` | Local-only (Ignored) | Bị `.gitignore:101` chặn. Chứa cấu hình môi trường kiểm thử staging. | Dùng chung mẫu với `appsettings.example.json`. |
| 5 | `docker-compose/.env` | Local-only (Ignored) | Bị `.gitignore:109` chặn. Chứa mật khẩu quản trị PostgreSQL, RabbitMQ, secret JWT. | Đã có `docker-compose/.env.example` đầy đủ 11 dịch vụ tại Nhóm 2. |
| 6 | `apps/frontend/ecommerce-client/.env.local` | Local-only (Ignored) | Bị `.gitignore:109` chặn. Chứa biến môi trường local của Next.js client. | Đã có `apps/frontend/ecommerce-client/.env.example` tại Nhóm 2. |
| 7 | `apps/frontend/ecommerce-dashboard/.env` & `.env.local` | Local-only (Ignored) | Bị `.gitignore:109` chặn. Chứa URL kết nối backend local của dashboard. | Đã có `apps/frontend/ecommerce-dashboard/.env.example` tại Nhóm 2. |
| 8 | `apps/backend/**/ecommerce.db` | Local-only (Ignored) | Bị `.gitignore:105` chặn. Cơ sở dữ liệu SQLite cục bộ sinh ra khi chạy dev. | Lược đồ DB được định nghĩa qua chuỗi 6 EF Core Migrations. |
| 9 | `apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads/*` | Local-only (Ignored) | Bị `.gitignore:114` chặn. Thư mục chứa ảnh upload local trong quá trình dev. | Production sử dụng Supabase Storage; không lưu trữ file nhị phân vào Git. |
| 10 | `apps/backend/Ecommerce/Ecommerce.WebAPI/logs/*` | Local-only (Ignored) | Bị `.gitignore:105` chặn. Tệp nhật ký rolling log của Serilog ghi trên đĩa. | Giám sát tập trung qua dịch vụ Elastic/Grafana. |
| 11 | Thư mục Build: `bin/`, `obj/`, `.vs/`, `*.lscache`, `PublishProfiles/` | Local-only (Ignored) | Bị `.gitignore` .NET chặn. File nhị phân biên dịch của C# / .NET SDK. | Tự động sinh qua lệnh `dotnet build` / `dotnet restore`. |
| 12 | Thư mục Node: `.next/`, `node_modules/`, `tsconfig.tsbuildinfo` | Local-only (Ignored) | Bị `.gitignore` Node chặn. Dependencies và bundle kết xuất của Next.js. | Tự động sinh qua lệnh `npm install` và `npm run build`. |
| 13 | Thư mục Trợ lý AI: `.agents/`, `.claude/`, `.kilo/`, `.dotnet-home/` | Local-only (Ignored) | Bị `.gitignore` chặn. Thư mục metadata phân công công việc teamwork. | Metadata làm việc của AI, không thuộc mã nguồn ứng dụng. |
| 14 | `docs/reports/KIEM_KE_HIEN_TRANG.md` | Local-only (Ignored) | Bị `.gitignore:124` chặn. Báo cáo kiểm kê hiện trạng đối soát ban đầu. | Lưu trữ tại local làm căn cứ kiểm toán đối soát độc lập. |
| 15 | `docs/reports/KE_HOACH_CAP_NHAT_TAI_LIEU.md` | Local-only (Ignored) | Bị `.gitignore:124` chặn. Kế hoạch chi tiết ban đầu trước khi chia nhóm. | Lưu trữ tại local làm căn cứ kiểm toán đối soát độc lập. |
| 16 | `docs/backend-sync/ShopViet_2026_Master_QA_Report_*.csv` (3 files) | Local-only (Ignored) | Bị `.gitignore:124` chặn. Bảng tính dữ liệu kiểm thử QA tự động giai đoạn cũ. | Số liệu tổng kết đã được đúc kết vào các tài liệu markdown. |
| 17 | `docs/design/stitch/*` | Local-only (Ignored) | Bị `.gitignore:124` chặn. Các tệp HTML mockup kết xuất từ công cụ Stitch. | Giao diện thực tế đã được code hoàn chỉnh trên Next.js client. |
| 18 | `docs/ui-ux-redesign/` (code prototype `*.tsx`, `tokens.css`) | Local-only (Ignored) | Bị `.gitignore:124` chặn. Mã nguồn prototype giai đoạn thiết kế concept. | Toàn bộ component chính thức đã được tích hợp vào `apps/frontend/`. |

---

## TỔNG KẾT & KẾT LUẬN

1. **Tính Toàn vẹn & Nhất quán 100%:**
   - Tất cả 28 tài liệu sống Loại A đều đã có dòng mốc chuẩn đầu trang: `"Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493"`.
   - Các số liệu thống nhất tuyệt đối xuyên suốt toàn bộ hệ sinh thái tài liệu: **36 controllers**, **PostgreSQL & SQLite** (không có SQL Server), **6 migrations**, **3 test projects với 55 test files**, **11 dịch vụ docker-compose**, **27 routes client** (Next 15, React 19), **71 routes dashboard** (Next 15, React 18.3.1), **45 showroom**, **hotlines 1800 6868/6869**, **freeship từ 500.000₫**, **cọc COD 10% khi đơn > 20 triệu**, **RMA 7 ngày**.
   - Hai tệp ngữ cảnh AI trợ lý `AGENTS.md` và `CLAUDE.md` tại thư mục gốc hoàn toàn trùng khớp từng dòng (0 diff).
2. **Bảo tồn Tuyệt đối Tài liệu Lịch sử (Loại B):**
   - Đã đóng gói trọn vẹn 51 tệp tài liệu Loại B với banner chuẩn lưu trữ.
   - 100% nội dung gốc bên dưới banner được bảo toàn nguyên trạng ở cấp độ byte nhị phân.
3. **Kỷ luật Mã nguồn & Hạ tầng:**
   - Hoàn toàn không sửa đổi mã nguồn nghiệp vụ của Backend hoặc Frontend.
   - Hoàn toàn không sửa đổi tệp `.gitignore`.
   - Toàn bộ thay đổi được phân nhóm và commit có cấu trúc trên nhánh `docs/sync-with-code`.
   - Tuyệt đối không thực thi lệnh `git push` lên máy chủ từ xa.
