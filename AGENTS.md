# ShopViet E-Commerce — AI Assistant Context

## Mục đích
Nền tảng thương mại điện tử Việt Nam (Vietnamese market) gồm 3 app:
- **Backend**: ASP.NET Core 8 REST API (Clean Architecture + DDD + CQRS)
- **ecommerce-client**: Next.js 15 — giao diện khách hàng
- **ecommerce-dashboard**: Next.js 15 — trang quản trị admin

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, MediatR (CQRS), EF Core 8, FluentValidation, AutoMapper, Serilog |
| Auth | JWT + httpOnly Cookie (dual), CSRF middleware, Redis session |
| Database | SQL Server (local dev) / PostgreSQL (Docker/Render) / SQLite (fallback) |
| Cache | Redis (optional) — falls back to memory cache |
| Search | Elasticsearch (optional) — falls back to SQL LIKE via `NoOpProductSearchService` |
| Storage | Local `uploads/` (dev) / Supabase (production) |
| Real-time | SignalR WebSocket hubs (notifications + reviews) |
| Payment | VNPay sandbox (Vietnamese gateway) |
| Frontend | Next.js 15, React 19, Tailwind CSS v4, TanStack Query v5, React Hook Form + Zod |
| Dashboard extras | TanStack Table, Recharts, @dnd-kit, Storybook |

## Dev Commands

### Backend
```bash
cd apps/backend/Ecommerce
dotnet restore
dotnet run --project Ecommerce.WebAPI          # → http://localhost:5000/swagger
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

### Docker (toàn bộ stack)
```bash
cd docker-compose
cp .env.example .env          # điền secrets trước
docker compose up             # PostgreSQL + Redis + Elasticsearch + 3 app
docker compose down
```

## Cấu trúc thư mục

```
apps/
  backend/Ecommerce/
    Ecommerce.Domain/          # Entities, Value Objects, Domain Events
    Ecommerce.Application/     # CQRS Commands/Queries, Interfaces, DTOs
    Ecommerce.Infrastructure/  # EF Core, Repositories, External Services, Migrations/
    Ecommerce.WebAPI/          # Controllers (26), Middleware, Program.cs, appsettings.json
    TemplateEngineHost/        # Razor email templates
  frontend/
    ecommerce-client/app/      # (auth)/ và (routes)/ — Next.js App Router
    ecommerce-dashboard/app/   # (auth)/ và (dashboard)/
docker-compose/
  docker-compose.yml
  .env.example                 # Template — KHÔNG commit .env
docs/                          # Business requirements, auth proposal, security docs
```

## Code Conventions

**Backend (.NET)**
- CQRS: mỗi feature = `Commands/` + `Queries/` dưới `Application/<Feature>/`
- Repository pattern + Unit of Work qua EF Core
- Middleware custom: `CsrfValidation`, `GlobalExceptionHandling`, `RequestLogging`, `AccountLock`, `ForwardedHeaders`
- DI tự động qua Scrutor assembly scanning

**Frontend**
- `services/` — Axios API calls
- `hooks/` — custom React hooks (TanStack Query wrappers)
- `types/` — TypeScript interfaces
- `hubs/` — SignalR connection logic (client only)
- Zod schema validation kép: client-side + FluentValidation server-side

## Gotchas & Lưu ý quan trọng

1. **Auth cookie**: Access token 15 phút, refresh 7 ngày — cả hai là httpOnly cookie, không phải localStorage. CSRF token phải gửi trong header cho POST/PUT/DELETE.

2. **Database**: Local dev dùng **SQL Server** (Windows Auth), Docker dùng **PostgreSQL**. Connection string khác nhau — kiểm tra `appsettings.json` vs `docker-compose/.env`.

3. **Migrations**: Một migration duy nhất `InitialCreate` (`20260324124536`). Khi thêm entity mới, chạy lệnh `ef migrations add` ở trên.

4. **Elasticsearch & Redis**: Cả hai là **optional**. Tắt ES → `NoOpProductSearchService`. Tắt Redis → memory cache. Không cần chạy cả stack để dev.

5. **Seeding**: Tự động seed data (admin user, roles, sample products) khi `ASPNETCORE_ENVIRONMENT=Development`.

6. **Không có tests**: Chưa có unit test hoặc integration test nào.

7. **Render deployment**: `render.yaml` cấu hình sẵn — auto-deploy khi push. Backend free tier, không có GitHub Actions CI/CD.

8. **Supabase storage**: Dùng cho production. Local dev dùng thư mục `uploads/` — đừng commit ảnh vào git.

## Quy chuẩn UI/UX & Dữ liệu SSoT 2026 (Bất di bất dịch)

1. **Dữ liệu Chuẩn Một Nguồn (SSoT 2026):**
   - **Showroom:** Hệ thống 45 Showroom công nghệ hiện đại toàn quốc.
   - **Hotlines:** Hotline bán hàng `1800 6868` & Hotline kỹ thuật `1800 6869` (miễn phí cước gọi).
   - **Miễn phí vận chuyển (Freeship):** Áp dụng cho đơn hàng từ **500.000₫** trở lên (tiến độ thanh toán theo dõi trên CartHeader). Đơn dưới 500k tính phí 30.000₫.

2. **Quy chuẩn Định dạng Tiền tệ (Currency Formatting):**
   - Mọi nơi hiển thị giá tiền (ProductCard, Cart, Checkout, OrderDetails, Wishlist) **bắt buộc** phải có các class:
     `font-mono tabular-nums whitespace-nowrap` (hoặc class `.price-tag`).
   - Tuyệt đối không để ký hiệu đơn vị tiền tệ (`₫` hoặc `VND`) rớt dòng một mình.

3. **Phân Vai Màu Sắc Kép (Dual-Accent Tech Hierarchy):**
   - **Tech Crimson (`#E11D48` / `bg-brand` / `text-brand`):** Dành riêng cho các hành động mua hàng / chuyển đổi bán hàng (`Nút Mua ngay`, `Nút Tiến hành thanh toán`, `Giá bán khuyến mãi`, `Badge % giảm giá`).
   - **Electric Blue (`#2563EB` / `bg-tech-blue` / `text-tech-blue`):** Dành cho các tính năng công nghệ và tương tác (`Nút Thêm vào giỏ`, `Bộ lọc đang chọn`, `Badge bảo hành 24T chính hãng`, `Icon cam kết`, `Focus ring`).
   - **Tuyệt đối KHÔNG hardcode hex code** (ví dụ `bg-[#2563eb]`, `text-[#e11d48]`) vào JSX/TSX. Luôn dùng semantic tokens (`bg-brand`, `bg-tech-blue`, `bg-card`, `text-ink`, `border-line`).

4. **Chuẩn Bề Mặt & Chế Độ Tối (Surfaces & Dark Mode):**
   - **Light Mode:** Nền `bg-background` (`#F8FAFC`), thẻ `bg-card` (`#FFFFFF`), bề mặt phụ `bg-surface` (`#F1F5F9`), viền `border-line` (`#E2E8F0`).
   - **Dark Mode:** Phân tầng 4 lớp Deep Obsidian (`#090D16` nền chính, `#111827` card, `#182234` spec chips, `#1E293B` elevated/hover). Đảm bảo WCAG 2.1 AA contrast $\ge 4.5:1$.

