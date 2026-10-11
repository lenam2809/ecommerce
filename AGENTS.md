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
