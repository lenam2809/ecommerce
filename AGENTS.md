Cập nhật lần cuối: 27/11/2026 — đối chiếu commit a835efb

Render dùng `GET /health/ready` trong Production. Endpoint trả `200` khi kết nối được cơ sở dữ liệu và `503` khi chưa sẵn sàng. Cấu hình kết nối PostgreSQL Supabase qua `ConnectionStrings__DefaultConnection` trong Render Environment.

# ShopViet E-Commerce — AI Assistant Context

## Mục đích
Nền tảng thương mại điện tử Việt Nam (Vietnamese market) gồm 3 app:
- **Backend**: ASP.NET Core 8 REST API (Clean Architecture + DDD + CQRS) — 36 controllers
- **ecommerce-client**: Next.js 15 (React 19) — giao diện khách hàng (27 routes)
- **ecommerce-dashboard**: Next.js 15 (React 18.3.1) — trang quản trị admin (71 routes)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, MediatR (CQRS), EF Core 8, FluentValidation, AutoMapper, Serilog (36 Controllers) |
| Auth | JWT + httpOnly Cookie (dual), CSRF middleware, Redis session |
| Database | PostgreSQL (Docker/Render) / SQLite (Local dev nhanh) — không hỗ trợ SQL Server |
| Cache | Redis (optional) — falls back to memory cache |
| Search | Elasticsearch (optional) — falls back to SQL LIKE via `NoOpProductSearchService` |
| Storage | Local `uploads/` (dev) / Supabase (production) |
| Real-time | SignalR WebSocket hubs (notifications + reviews) |
| Payment | VNPay sandbox (Vietnamese gateway) & COD (Backend) |
| Frontend Client | Next.js 15, React 19, Tailwind CSS v4, TanStack Query v5, React Hook Form + Zod (27 routes) |
| Frontend Dashboard | Next.js 15, React 18.3.1, Tailwind CSS v4, TanStack Query v5, TanStack Table v8, Recharts, @dnd-kit (71 routes) |
| Testing | 3 test projects với 55 test files (`Application.Tests`, `Domain.Tests`, `IntegrationTests`) |
| CI/CD | GitHub Actions (`frontend-quality.yml`) |

## Dev Commands

### Backend
```bash
cd apps/backend/Ecommerce
dotnet restore

# Chạy toàn bộ 55 test files trên 3 dự án
dotnet test

# Chạy WebAPI (mặc định SQLite qua appsettings.Development.json hoặc PostgreSQL qua Docker)
dotnet run --project Ecommerce.WebAPI          # → http://localhost:5000/swagger

# EF Core Migrations (SQLite / PostgreSQL)
dotnet ef migrations add <Name> \
  --project Ecommerce.Infrastructure \
  --startup-project Ecommerce.WebAPI
dotnet ef database update \
  --project Ecommerce.Infrastructure \
  --startup-project Ecommerce.WebAPI
```

### Frontend Client (port 3000)
```bash
cd apps/frontend/ecommerce-client
npm install && npm run dev
npm run build && npm run lint
```

### Frontend Dashboard (port 3001)
```bash
cd apps/frontend/ecommerce-dashboard
npm install && npm run dev
npm run build && npm run lint
```

### Docker (toàn bộ stack 11 dịch vụ)
```bash
cd docker-compose
cp .env.example .env          # điền secrets trước
docker compose up             # PostgreSQL + Redis + RabbitMQ + Elasticsearch + Jaeger + Prometheus + Alertmanager + Grafana + 3 app
docker compose down
```

## Cấu trúc thư mục

```
apps/
  backend/Ecommerce/
    Ecommerce.Domain/          # 67 Entities, Value Objects, Domain Events, Enums
    Ecommerce.Application/     # CQRS Commands/Queries, Interfaces, DTOs
    Ecommerce.Infrastructure/  # EF Core (PostgreSQL/SQLite), 6 Migrations, Repositories, External Services, EmailTemplates/
    Ecommerce.WebAPI/          # Controllers (36), Middleware, Program.cs, appsettings.json
    TemplateEngineHost/        # Visual Studio template cache (vs/)
  frontend/
    ecommerce-client/app/      # (auth)/ và (routes)/ — Next.js 15 (React 19), 27 routes
    ecommerce-dashboard/app/   # (auth)/ và (dashboard)/ — Next.js 15 (React 18.3.1), 71 routes
  tests/
    Ecommerce.Application.Tests/       # 30 test files (CQRS, validation, services)
    Ecommerce.Domain.Tests/            # 12 test files (Domain entities, order flow, inventory)
    Ecommerce.WebAPI.IntegrationTests/  # 13 test files (API integration, auth, outbox)
docker-compose/
  docker-compose.yml           # 11 dịch vụ hoàn chỉnh
  .env.example                 # Template — KHÔNG commit .env
docs/                          # Business requirements, architecture, SSoT docs
```

## Code Conventions

**Backend (.NET)**
- CQRS: mỗi feature = `Commands/` + `Queries/` dưới `Application/<Feature>/`
- Repository pattern + Unit of Work qua EF Core
- Middleware custom: `CsrfValidation`, `GlobalExceptionHandling`, `RequestLogging`, `AccountLock`, `ForwardedHeaders`, `GuestCartMiddleware`
- DI tự động qua Scrutor assembly scanning

**Frontend**
- `services/` — Axios API calls
- `hooks/` — custom React hooks (TanStack Query wrappers)
- `types/` — TypeScript interfaces
- `hubs/` — SignalR connection logic (client only)
- Zod schema validation kép: client-side + FluentValidation server-side

## Quy tắc Đồng bộ Tài liệu & Nguồn Sự Thật (SSoT Governance)

1. **Mã nguồn là Nguồn Sự Thật duy nhất (Codebase is SSoT):**
   - Tuyệt đối không dùng `AGENTS.md`, `CLAUDE.md`, `README.md` hay bất kỳ tài liệu nào để suy ra số liệu hoặc hành vi hệ thống.
   - Mọi số liệu (số lượng controller, endpoint, entity, enum, migration, test file, route, màn hình) phải được lấy từ lệnh CLI thực tế ngay tại thời điểm viết (`git`, `dotnet`, `npm`, script kiểm kê), tuyệt đối không viết theo trí nhớ hay giả định.

2. **Cập nhật Tài liệu Sống Đồng thời (Atomic Living Docs Sync):**
   - Khi có bất kỳ thay đổi nào thuộc các hạng mục sau:
     - **API & Backend:** Controller, endpoint, route attribute, HTTP method, DTO.
     - **Dữ liệu & CSDL:** Entity, Value Object, Enum (tên và giá trị số), EF Core Migration, Snapshot.
     - **Cấu hình & Hạ tầng:** Biến môi trường, key cấu hình (`appsettings*.json`, `docker-compose.yml`, `render.yaml`, `.env.example`).
     - **Giao diện & Tuyến đường:** Route / Màn hình (`page.tsx`) của `ecommerce-client` hoặc `ecommerce-dashboard`.
     - **Quy tắc Nghiệp vụ cốt lõi:** Phí ship, ngưỡng Freeship, cọc COD 10% (>20M), thời hạn đổi trả RMA, ma trận chuyển trạng thái đơn hàng (`EOrderStatus`), thời hạn sống của Token/Cookie, tích hợp cổng thanh toán.
   - **Bắt buộc:** Phải cập nhật toàn bộ tài liệu sống tương ứng (`AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/architecture-backend.md`, README của từng app frontend) trong **cùng lần thay đổi (cùng commit)**.
   - **Dòng mốc bắt buộc:** Phải cập nhật lại dòng đầu tiên của tài liệu sống:  
     `"Cập nhật lần cuối: <ngày/tháng/năm> — đối chiếu commit <hash ngắn>"`

## Gotchas & Lưu ý quan trọng

1. **Auth cookie & Guest Cart**:
   - Access token: JWT payload claim sống 60 phút, nhưng Cookie `access_token` được trình duyệt cấu hình thời hạn 15 phút. Refresh token sống 7 ngày. Cả hai là httpOnly cookie, không lưu trong localStorage. CSRF token gửi trong header `X-CSRF-Token` cho các request POST/PUT/DELETE.
   - Guest Cart (giỏ hàng khách vãng lai): Sử dụng server-side httpOnly cookie `guest_id` thời hạn 7 ngày sinh từ `GuestCartMiddleware`. Dữ liệu giỏ hàng lưu trực tiếp trong CSDL (bảng `Carts`) qua cột `AnonymousId` (hoàn toàn không dùng Redis cho giỏ hàng).

2. **Database**: Hỗ trợ 2 DBMS: **PostgreSQL** (Docker/Render) và **SQLite** (Local dev nhanh). Hệ thống **hoàn toàn không hỗ trợ SQL Server** (không có provider EF Core SQL Server). Kiểm tra `appsettings.Development.json` (`Data Source=ecommerce.db`) vs `docker-compose/.env` (`Host=postgres...`).

3. **Migrations**: Hệ thống có **6 migrations** (không phải 1):
   - `20260507115052_InitialCreate.cs` (khởi tạo lược đồ cơ sở dữ liệu ban đầu)
   - `20260516123045_AddReviewProductUserUniqueIndex.cs`
   - `20260517012236_AddOutboxMessages.cs`
   - `20261015140903_RefactorCartItemSurrogateKey.cs`
   - `20261020155436_AddTechEcommerceSchema2026.cs`
   - `20261021121358_AddTechEcommerceSpecsAndShowrooms2026.cs` (mới nhất)

4. **Elasticsearch & Redis**: Cả hai là **optional**. Tắt ES → fallback SQL LIKE qua `NoOpProductSearchService`. Tắt Redis → fallback in-memory cache. Không cần chạy cả stack để dev.

5. **Seeding**: Tự động seed data (admin user, 4 roles, 45 showrooms, categories, sample tech products, specs) khi `ASPNETCORE_ENVIRONMENT=Development`.

6. **Kiểm thử tự động (Tests)**: Có **3 test projects** với **55 test files** (`Ecommerce.Application.Tests`, `Ecommerce.Domain.Tests`, `Ecommerce.WebAPI.IntegrationTests`). Chạy bằng lệnh `dotnet test`.

7. **CI/CD & Deployment**: Đã có GitHub Actions workflow `.github/workflows/frontend-quality.yml` (kiểm tra typecheck, lint, build cho client và dashboard). Render deployment cấu hình tại `render.yaml` (auto-deploy khi push nhánh chính).

8. **Cổng thanh toán (Gateways)**: Backend chỉ tích hợp xử lý thực tế cho **COD** và **VNPay** (`VnPayPaymentGateway.cs`). Các phương thức MoMo, ZaloPay, VietQR mới chỉ có giao diện phía client, khi checkout chỉ ghi nhận tên phương thức vào database.

9. **Supabase storage**: Dùng cho production. Local dev dùng thư mục `uploads/` — đừng commit ảnh vào git.

## Quy chuẩn UI/UX & Dữ liệu SSoT 2026 (Bất di bất dịch)

1. **Dữ liệu Chuẩn Một Nguồn (SSoT 2026):**
   - **Showroom:** Hệ thống 45 Showroom công nghệ hiện đại toàn quốc.
   - **Hotlines:** Hotline bán hàng `1800 6868` & Hotline kỹ thuật `1800 6869` (miễn phí cước gọi).
   - **Miễn phí vận chuyển (Freeship):** Áp dụng cho đơn hàng từ **500.000₫** trở lên (tiến độ thanh toán theo dõi trên CartHeader). Đơn dưới 500k tính phí 30.000₫. Đơn rỗng (0₫) tính phí 0₫. Mã voucher `FREESHIP` giảm 100% phí ship.
   - **Cọc COD 10% cho đơn hàng giá trị cao:** Đơn hàng chọn thanh toán COD có tổng tiền `TotalAmount > 20.000.000₫` (lớn hơn 20 triệu đồng) bắt buộc phải cọc trước **10%** (`DepositRequired = Math.Round(TotalAmount * 0.10m)`), 90% còn lại thu khi giao hàng. Trạng thái cọc ban đầu là `Pending`.
   - **Chính sách đổi trả (RMA):** Thời hạn tạo yêu cầu đổi trả là **7 ngày** kể từ ngày giao hàng thành công (`Delivered`).

2. **Quy chuẩn Định dạng Tiền tệ (Currency Formatting):**
   - Mọi nơi hiển thị giá tiền (ProductCard, Cart, Checkout, OrderDetails, Wishlist) **bắt buộc** phải có các class:
     `font-mono tabular-nums whitespace-nowrap` (hoặc class `.price-tag`).
   - Tuyệt đối không để ký hiệu đơn vị tiền tệ (`₫` hoặc `VND`) rớt dòng một mình.

3. **Phân Vai Màu Sắc Kép (Dual-Accent Tech Hierarchy):**
   - **Tech Crimson (`#E11D48` / `bg-brand` / `text-brand` / `--brand`):** Dành riêng cho các hành động mua hàng / chuyển đổi bán hàng (`Nút Mua ngay`, `Nút Tiến hành thanh toán`, `Giá bán khuyến mãi`, `Badge % giảm giá`, `Hot deal`).
   - **Electric Blue (`#2563EB` ở Light, `#3B82F6` ở Dark / `bg-tech-blue` / `text-tech-blue` / `--primary`):** Dành cho các tính năng công nghệ và tương tác (`Nút Thêm vào giỏ`, `Bộ lọc đang chọn`, `Badge bảo hành 24T chính hãng`, `Icon cam kết kỹ thuật`, `Focus ring`).
   - **Tuyệt đối KHÔNG hardcode hex code** (ví dụ `bg-[#2563eb]`, `text-[#e11d48]`) vào JSX/TSX. Luôn dùng semantic tokens (`bg-brand`, `bg-tech-blue`, `bg-card`, `text-ink`, `border-line`).

4. **Chuẩn Bề Mặt & Chế Độ Tối (Surfaces & Dark Mode):**
   - **Light Mode:** Nền `bg-background` (`#F8FAFC`), thẻ `bg-card` (`#FFFFFF`), bề mặt phụ `bg-surface` (`#F1F5F9`), viền `border-line` (`#E2E8F0`).
   - **Dark Mode:** Phân tầng 4 lớp Deep Obsidian:
     - Lớp 0 (Nền chính canvas): `#090D16` (`--background`)
     - Lớp 1 (Card & Container): `#111827` (`--card`)
     - Lớp 2 (Chips, Spec tags): `#182234` (`--secondary`)
     - Lớp 3 (Elevated / Hover): `#1E293B` (`--surface-hover`)
     Đảm bảo WCAG 2.1 AA contrast $\ge 4.5:1$.

5. **Vòng đời & Luồng Chuyển Trạng thái Đơn hàng (Order State Transitions):**
   - Chuỗi trạng thái chuẩn trong Domain (`Order.cs`):
     - `Pending (0) -> Processing (1) -> Shipped (2) -> Delivered (6) -> Completed (3)`
     - Nhánh hủy: `Pending (0) / Processing (1) -> Cancelled (4)`
     - Nhánh đổi trả: `Shipped (2) / Delivered (6) -> ReturnRequested (7) -> Returned (8) -> Refunded (5)`
   - Chú ý quan trọng: Tuyệt đối không nhảy cóc từ `Shipped` thẳng sang `Completed` (bắt buộc phải qua `Delivered`). Mọi bước chuyển sai sẽ ném ngoại lệ `InvalidStatusTransitionException`.

## Sai lệch đã biết (Known Discrepancies)

Các điểm sai lệch giữa mã nguồn hiện tại và tài liệu/thiết kế được ghi nhận để các kỹ sư và AI Assistant không ngộ nhận:
1. **Ngưỡng Freeship:**
   - Chuẩn nghiệp vụ (SSoT) và Frontend (`CartHeader.tsx`, `OrderSummary.tsx`): Áp dụng freeship khi `subtotal >= 500.000₫`.
   - Backend (`ShippingCalculator.cs:34`): Đang dùng toán tử `>` (`subtotal > FREE_SHIPPING_THRESHOLD`). Do đó, đơn hàng có đúng 500.000₫ tại backend vẫn bị tính phí 30.000₫.
2. **Thời hạn Token vs Cookie Auth:**
   - Payload JWT claim (`TokenService.cs:54`): Sinh ra thời hạn hết hạn là 60 phút (`AccessTokenExpirationMinutes`).
   - Cookie trình duyệt (`CookieAuthExtensions.cs:36`): Thiết lập `Expires` theo cấu hình `CookieSettings:AccessTokenMinutes` (fallback mặc định 15 phút). Trình duyệt sẽ thu hồi cookie sau 15 phút dù JWT bên trong còn hiệu lực.
3. **Cổng thanh toán MoMo, ZaloPay, VietQR:**
   - Frontend Client (`payment-method.tsx`): Cung cấp các nút tùy chọn ví MoMo, ZaloPay, VietQR Pro.
   - Backend (`PaymentsController.cs`): Chưa có handler/webhook/IPN tích hợp cho các cổng này, chỉ lưu tên phương thức vào database. Chỉ có COD và VNPay là được xử lý trọn vẹn.
4. **Secret cấu hình cũ lộ trong Git History:**
   - Commit `695e86f84c15` (01/04/2026) từng đưa trực tiếp cấu hình chứa secret VNPay sandbox và connection string vào git.
   - Commit `0b346f35aaf0` (08/04/2026) đã xóa các file này khỏi git và đưa vào `.gitignore`, tuy nhiên secret vẫn còn lưu trong lịch sử commit.
5. **Lệch Enum trạng thái đơn hàng tại Frontend Client:**
   - Backend `EOrderStatus`: Gồm 9 trạng thái (`Pending=0`, `Processing=1`, `Shipped=2`, `Completed=3`, `Cancelled=4`, `Refunded=5`, `Delivered=6`, `ReturnRequested=7`, `Returned=8`).
   - Client (`types/order.ts`): Chỉ định nghĩa 6 trạng thái và gán `Delivered=3` (thay vì `6`), thiếu `Completed` và `Refunded`.
