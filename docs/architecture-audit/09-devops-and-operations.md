> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/docker-compose-services/README.md`](../docker-compose-services/README.md).

# 09 — Vận hành, DevOps & Hạ tầng Triển khai (DevOps & Operations)

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phạm vi:** Dockerfile, docker-compose, render.yaml, CI/CD GitHub Actions, Observability (Jaeger, Prometheus, Serilog).

---

## 1. Hạ tầng Triển khai & Containerization

Hệ thống hỗ trợ 2 phương án triển khai chính:
1. **Cụm Docker Compose Cục bộ / Tự quản (Self-hosted)**:
   - File cấu hình: `docker-compose/docker-compose.yml`.
   - Gồm 9 services: `backend`, `frontend-client`, `frontend-dashboard`, `postgres`, `redis`, `elasticsearch`, `jaeger`, `prometheus`, `alertmanager`.
2. **Cloud PaaS Triển khai Tự động trên Render**:
   - File cấu hình: `render.yaml`.
   - Triển khai miễn phí (Free Tier): Web service `ecommerce-backend` (Docker), Key-value store `ecommerce-redis`, PostgreSQL database `ecommerce-db` (v15).

---

## 2. Kiểm toán Chi tiết Cấu hình DevOps & Môi trường

### 2.1. Cấu hình Docker Compose & Sai sót Biến Môi trường
Trong [docker-compose/.env](file:///d:/2026/projects/ecommerce/docker-compose/.env):
1. **Lỗi Biến Môi trường Frontend Gọi Backend (`NEXT_PUBLIC_API_URL`)**:
   - Dòng 57: `NEXT_PUBLIC_API_URL=http://backend:5000/api`.
   - **Cơ chế:** Các biến có tiền tố `NEXT_PUBLIC_*` trong Next.js được biên dịch cứng (baked at build-time) vào mã nguồn JavaScript chạy trên trình duyệt người dùng.
   - **Hậu quả:** Tên miền `backend` là hostname nội bộ trong mạng Docker (`ecommerce-network`). Khi người dùng mở trình duyệt ngoài máy tính để truy cập trang web, trình duyệt sẽ gửi request tới `http://backend:5000/api` và lập tức gặp lỗi **`ERR_NAME_NOT_RESOLVED`**!
   - **Khắc phục:** Bắt buộc cấu hình `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (cho local docker) hoặc tên miền công khai `https://api.shopviet.online/api` (cho production).
2. **Trùng lặp Khóa cấu hình JWT trong `.env`**:
   - Dòng 45: `JWT_SECRET_KEY=2Eux5qsPJkbI6gwiyFM4eDTVK7hvOd1S`
   - Dòng 49: `JWT_SECRET_KEY=351c50ccaa38aaf852e6cbd7504d440eba8032e776f5e7688837fbf13202121b`
   - Cùng một file cấu hình nhưng khai báo `JWT_SECRET_KEY` hai lần với hai giá trị khác nhau, dễ gây khó khăn khi debug lỗi chữ ký token.

### 2.2. Kiểm toán Triển khai Render (`render.yaml`)
- **Điểm mạnh:**
  - Cấu hình an toàn: `Jwt__SecretKey` và `Auth__TokenHashSecret` được thiết lập `generateValue: true`, Render sẽ tự động sinh chuỗi ngẫu nhiên bảo mật cao mà không cần lưu trong file cấu hình git.
  - Tự động liên kết cơ sở dữ liệu `ecommerce-db` qua `fromDatabase` và Redis qua `fromService`.
- **Rủi ro vận hành (Operational Risks):**
  - **Cold Start (Render Free Tier)**: Render tự động chuyển web service sang chế độ ngủ (sleep) sau 15 phút không có request. Khi có lượt truy cập đầu tiên, thời gian khởi động container .NET 8 kết hợp kết nối PostgreSQL và chạy migration có thể mất từ 40–60 giây, dễ gây timeout cho frontend.
  - **Tự động Seed dữ liệu khi boot**: Vì `Program.cs` dòng 247 truyền cứng `SeedAsync(services, true)`, mỗi lần container Render thức dậy hoặc restart, hệ thống lại thực thi toàn bộ script seeder 2,923 dòng code.

---

## 3. Hệ thống Giám sát & Quan sát (Observability Stack)

### 3.1. Phân tán vết (Distributed Tracing với Jaeger)
- Cấu hình OTLP Exporter trong `Program.cs` gửi trace về `http://jaeger:4317`.
- Tự động instrument:
  - ASP.NET Core HTTP incoming requests (loại trừ `/metrics`).
  - Outgoing HTTP calls qua `AddHttpClientInstrumentation`.
  - Database calls qua `AddEntityFrameworkCoreInstrumentation`.
  - Redis cache calls qua `AddRedisInstrumentation`.
  - Tự động gắn tag `correlation.id` vào từng span để tra cứu liền mạch.

### 3.2. Đo lường Chỉ số (Metrics & Prometheus)
- Endpoint `/metrics` được mở tự động qua `UseOpenTelemetryPrometheusScrapingEndpoint()`.
- Container Prometheus trong `docker-compose.yml` scrape metrics định kỳ mỗi 15 giây.
- Alertmanager đã có cấu hình file `alerts.yml` cảnh báo khi backend API hoặc Redis offline.

### 3.3. Thu thập & Lưu trữ Log (Serilog)
- Hỗ trợ ghi log đồng thời ra Console (dạng JSON màu) và File lưu trữ xoay vòng (`RollingFile`):
  - `InformationDays`: 14 ngày.
  - `ErrorDays`: 90 ngày.
  - `PerformanceDays`: 30 ngày.
- **Log Sanitizer**: Mọi log trước khi ghi ra đĩa đều được quét qua `LogSanitizer.cs` để che giấu mật khẩu, token, số thẻ ngân hàng.

---

## 4. Kiểm toán Pipeline CI/CD

- **Hiện trạng:**
  - Repository có file workflow duy nhất: `.github/workflows/frontend-quality.yml`.
  - Nhiệm vụ: Chạy `npm run lint` và `npm run build` cho `ecommerce-client` và `ecommerce-dashboard` trên mỗi Pull Request hoặc Push vào branch `main`/`codex`.
- **Khoảng trống CI/CD (Gaps):**
  - **Hoàn toàn thiếu Backend CI**: Không có workflow chạy `dotnet build` hoặc `dotnet test` cho backend. Khi có commit mới làm gãy logic backend (như 4 test fail trong `Ecommerce.Application.Tests`), GitHub Actions không hề phát hiện và chặn lại.
  - **Thiếu Automated Deploy Pipeline**: Không có bước deploy tự động lên staging/production sau khi test pass; hoàn toàn dựa vào webhook của Render.
