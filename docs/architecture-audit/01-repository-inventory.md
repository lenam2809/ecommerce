> **TÀI LIỆU LƯU TRỮ** — Nội dung phản ánh trạng thái dự án tại thời điểm 14/10/2026, không còn là hiện trạng. Xem tài liệu hiện hành: [`docs/reports/KIEM_KE_HIEN_TRANG.md`](../reports/KIEM_KE_HIEN_TRANG.md).

# 01 — Repository Inventory & Cấu trúc mã nguồn

> **Dự án:** ShopViet E-Commerce Platform  
> **Repository:** https://github.com/lenam2809/ecommerce  
> **Thời điểm kiểm toán:** 14/10/2026  
> **Phương pháp:** Kiểm kê tĩnh (source code, manifests, lockfiles), kiểm tra động (test runners, typecheck, linting, build scripts) và đối chiếu chéo cấu hình deployment.

---

## 1. Tổng quan Tech Stack phát hiện thực tế

| Thành phần | Khai báo trong tài liệu (README/AGENTS) | Thực tế phát hiện trong Codebase | Ghi chú & Sai lệch |
|---|---|---|---|
| **Backend Framework** | .NET 8.0 (ASP.NET Core Web API) | .NET 8.0 (`net8.0`), C# 12 | Khớp (`Ecommerce.WebAPI.csproj`) |
| **Backend Architecture** | Clean Architecture + DDD + CQRS | MediatR 12.4.1, Scrutor 6.0.1, FluentValidation 11.10.0, AutoMapper 15.1.3 | Khớp với mẫu thiết kế Clean Architecture |
| **Cơ sở dữ liệu (Database)** | SQL Server (local dev), PostgreSQL (Docker) | **SQLite** (`Microsoft.EntityFrameworkCore.Sqlite 8.0.10`) & **PostgreSQL** (`Npgsql.EntityFrameworkCore.PostgreSQL 8.0.10`) | ⚠️ **SAI LỆCH LỚN**: Hoàn toàn **KHÔNG CÓ** SQL Server provider trong backend. Chuỗi kết nối có "Data Source" chạy SQLite; còn lại chạy PostgreSQL |
| **Cache** | Redis ("Required" theo README, "Optional" theo AGENTS) | `StackExchange.Redis 8.0.10`, fallback `DistributedMemoryCache` | Đúng thực tế: có cờ `CacheSettings:UseRedis` cho phép chạy không cần Redis |
| **Tìm kiếm (Search)** | Elasticsearch 8.x (Optional) | `Elastic.Clients.Elasticsearch 8.16.3`, fallback `NoOpProductSearchService` / SQL LIKE | Khớp (`ElasticsearchProductSearchService` + ICU plugin) |
| **Storage** | Local `uploads/` (dev) / Supabase (prod) | `Supabase 1.0.0`, `SixLabors.ImageSharp 3.1.12`, local `wwwroot/uploads` | Khớp (`SupabaseStorageService` & `LocalFileStorageService`) |
| **Real-time** | SignalR WebSocket | `Microsoft.AspNetCore.SignalR` (`NotificationHub`, `ReviewHub`) | Khớp |
| **Thanh toán** | VNPay Sandbox | HMACSHA512 checksum, IPN webhook, Return callback | Khớp (`VnPayPaymentGateway.cs`) |
| **Frontend Client** | Next.js 15, React 19, Tailwind CSS v4 | Next.js 15.5.14, **React 19.0.0**, Tailwind CSS v4, TanStack Query v5.69.0, Zod 3.24.2 | Khớp |
| **Frontend Dashboard** | Next.js 15, React 19 (theo AGENTS.md) | Next.js 15.5.14, **React 18.3.1** (`@types/react 18.3.29`), TanStack Table 8.21.3, Recharts 2.15.2, @dnd-kit | ⚠️ **SAI LỆCH**: Dashboard dùng React 18.3.1, không phải React 19 |
| **Test Suite** | "Chưa có unit test hoặc integration test nào" (AGENTS.md) | **3 test projects, 265+ tests**: `Ecommerce.Domain.Tests` (57 tests), `Ecommerce.Application.Tests` (203 tests), `Ecommerce.WebAPI.IntegrationTests` (7 fixture files) | ⚠️ **SAI LỆCH LỚN**: Bộ test đã được xây dựng bài bản nhưng tài liệu chưa cập nhật |
| **CI/CD** | "Không có GitHub Actions CI/CD" (AGENTS.md) | `.github/workflows/frontend-quality.yml` (chạy lint/build cho frontend) | Đã có CI workflow cho frontend |

---

## 2. Cấu trúc thư mục & Bản đồ Module

```
ecommerce/
├── .github/
│   └── workflows/
│       └── frontend-quality.yml            # CI: lint & build frontend-client và frontend-dashboard
├── apps/
│   ├── backend/
│   │   └── Ecommerce/
│   │       ├── Ecommerce.Domain/           # Entities (58), Enums, Value Objects, Domain Events
│   │       ├── Ecommerce.Application/      # CQRS Commands & Queries (29 feature folders), Interfaces, DTOs, Behaviors
│   │       ├── Ecommerce.Infrastructure/   # EF Core, Identity, Repositories, Redis, Elasticsearch, Supabase, Outbox
│   │       ├── Ecommerce.WebAPI/           # 32 Controllers, Middleware, SignalR Hubs, Program.cs, appsettings.*
│   │       ├── Ecommerce.Domain.Tests/     # xUnit Domain entity unit tests (57 tests)
│   │       ├── Ecommerce.Application.Tests/# xUnit Application handler unit tests (203 tests)
│   │       ├── Ecommerce.WebAPI.IntegrationTests/ # WebApplicationFactory integration tests với SQLite
│   │       ├── TemplateEngineHost/         # Razor template hosting engine
│   │       └── Dockerfile                  # Multi-stage build .NET 8 WebAPI
│   └── frontend/
│       ├── ecommerce-client/               # Next.js 15.5.14 (React 19), Storefront cho khách hàng
│       │   ├── app/                        # App Router: (auth)/, (routes)/, api/
│       │   ├── components/                 # UI components (Radix UI, Lucide)
│       │   ├── hooks/                      # TanStack Query custom hooks
│       │   ├── hubs/                       # SignalR client connections
│       │   ├── services/                   # Axios API service wrappers
│       │   ├── schemas/                    # Zod validation schemas
│       │   └── types/                      # TypeScript definitions
│       └── ecommerce-dashboard/            # Next.js 15.5.14 (React 18), Admin panel
│           ├── app/                        # App Router: (auth)/, (dashboard)/
│           ├── components/                 # Admin data tables, dialogs, charts
│           ├── hooks/                      # TanStack Query hooks cho admin
│           ├── services/                   # Admin API services
│           ├── schemas/                    # Zod schemas cho admin forms
│           └── types/                      # Admin TypeScript interfaces
├── docker-compose/
│   ├── docker-compose.yml                  # Toàn bộ cụm: postgres, redis, elasticsearch, jaeger, prometheus, alertmanager, 3 apps
│   ├── elasticsearch.Dockerfile            # Custom ES image cài sẵn plugin analysis-icu
│   ├── observability/                      # Cấu hình Prometheus, Alertmanager, Jaeger
│   ├── .env.example                        # Template biến môi trường
│   └── .env                                # Local docker environment file (untracked)
├── docs/                                   # Tài liệu kiến trúc, security audit cũ, design mockups
├── render.yaml                             # Cấu hình Blueprint deploy Render (backend + redis + postgres)
├── AGENTS.md                               # AI Assistant instructions (chứa thông tin lỗi thời)
└── README.md                               # Tổng quan dự án (chứa thông tin lỗi thời về SQL Server)
```

---

## 3. Danh mục Package & Dependency quan trọng

### 3.1. Backend (.NET 8)
- `Microsoft.EntityFrameworkCore` (8.0.10)
- `Microsoft.EntityFrameworkCore.Sqlite` (8.0.10) — Dùng cho local development và integration tests
- `Npgsql.EntityFrameworkCore.PostgreSQL` (8.0.10) — Dùng cho Docker / Production
- `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0.10)
- `MediatR` (12.4.1)
- `FluentValidation.AspNetCore` (11.3.0)
- `AutoMapper` (15.1.3)
- `Scrutor` (6.0.1) — Dependency scanning tự động
- `Elastic.Clients.Elasticsearch` (8.16.3)
- `Microsoft.Extensions.Caching.StackExchangeRedis` (8.0.10)
- `Supabase` (1.0.0) — Production cloud storage
- `SixLabors.ImageSharp` (3.1.12) — Image resize & validation
- `EPPlus` (8.0.2) — Excel import/export
- `OpenTelemetry.Exporter.OpenTelemetryProtocol` (1.9.0) — Distributed tracing (Jaeger)
- `OpenTelemetry.Exporter.Prometheus.AspNetCore` (1.9.0-beta.2) — Metrics scraping
- `Serilog.AspNetCore` (8.0.2) + File sink + Enrichers

### 3.2. Frontend Client (`apps/frontend/ecommerce-client`)
- `next`: `^15.5.14`
- `react`: `^19.0.0` / `react-dom`: `^19.0.0`
- `@tanstack/react-query`: `^5.69.0`
- `tailwindcss`: `^4`
- `axios`: `^1.8.4`
- `react-hook-form`: `^7.54.2` + `@hookform/resolvers`: `^4.1.3`
- `zod`: `^3.24.2`
- `@microsoft/signalr`: `^8.0.7`
- `framer-motion`: `^12.23.12`
- `sanitize-html`: `^2.17.4`
- `sonner`: `^2.0.1`

### 3.3. Frontend Dashboard (`apps/frontend/ecommerce-dashboard`)
- `next`: `^15.5.14`
- `react`: `^18.3.1` / `react-dom`: `^18.3.1` (Khác biệt phiên bản React với Client)
- `@tanstack/react-query`: `^5.74.3`
- `@tanstack/react-table`: `^8.21.3`
- `recharts`: `^2.15.2`
- `@dnd-kit/core`: `^6.3.1`, `@dnd-kit/sortable`: `^10.0.0`
- `@storybook/react`: `^8.6.14`
- `date-fns`: `^3.6.0`, `lodash`: `^4.17.21`

---

## 4. Entry Points & Bootstrap Execution Flows

### 4.1. Backend WebAPI
- **File:** [Program.cs](file:///d:/2026/projects/ecommerce/apps/backend/Ecommerce/Ecommerce.WebAPI/Program.cs)
- **Bootstrap Pipeline:**
  1. `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)`: Tương thích kiểu DateTime Npgsql.
  2. `builder.Services.AddSignalR()` & `builder.Services.AddHttpContextAccessor()`
  3. `AddOptions<AuthTokenSettings>()` với `.ValidateOnStart()`: Đảm bảo app dừng ngay nếu thiếu token secret.
  4. `AddApplication()`: Đăng ký MediatR handlers, FluentValidation, AutoMapper.
  5. `AddInfrastructure()`: Đăng ký EF Core DbContext (chọn SQLite nếu chuỗi kết nối chứa "Data Source", ngược lại dùng Npgsql), Redis, Elasticsearch, Repositories, Identity.
  6. `AddOpenTelemetry()`: Jaeger trace exporter + Prometheus metrics scraping.
  7. `AddRateLimiter()`: Cấu hình `AuthPolicy` (100 req/m), `LoginPolicy` (20 req/m), `PasswordResetPolicy` (10 req/10m), `GlobalLimiter` (1000 req/m).
  8. Startup execution: `await context.Database.MigrateAsync()` và `await ApplicationDbContextSeed.SeedAsync(services, true)` — **chú ý: luôn chạy seed data kể cả khi không phải Development**.
  9. Middleware order: RateLimiter -> SecurityHeaders -> GlobalLogEnrichment -> RequestLogging -> GlobalExceptionHandling -> Routing -> CORS -> StaticFiles -> Authentication -> AccountLockCheck -> GuestCart -> CsrfValidation -> Authorization -> Endpoints/SignalR.

### 4.2. Frontend Client
- **File:** `app/layout.tsx` & `middleware.ts`
- **Port:** 3000
- **Routing:** App Router với group `(auth)` và `(routes)`.
- **Middleware:** `middleware.ts` thực hiện kiểm tra cookie `access_token` để chuyển hướng bảo vệ các trang `/profile`, `/orders`, `/checkout`.

### 4.3. Frontend Dashboard
- **File:** `app/layout.tsx` & `middleware.ts`
- **Port:** 3001
- **Routing:** App Router với group `(auth)` và `(dashboard)`.
- **Middleware:** `middleware.ts` kiểm tra cookie `access_token` và giải mã role (phải là `Admin` hoặc `Employee`) trước khi cho phép vào các trang quản trị.

---

## 5. Kết quả xác minh các lệnh Build, Test, Lint

| Lệnh thực thi | Môi trường | Kết quả thực tế | Chi tiết lỗi / Cảnh báo |
|---|---|---|---|
| `dotnet test ...Ecommerce.Domain.Tests.csproj` | Local Windows | ✅ **PASS (57/57)** | Thời gian chạy: 157 ms. 0 fail. |
| `dotnet test ...Ecommerce.Application.Tests.csproj` | Local Windows | ❌ **FAIL (199 pass / 4 fail)** | 4 tests trong `LoginUserCommandHandlerTests.cs` fail do handler trả về thông báo tiếng Việt ("Email hoặc mật khẩu không đúng.") trong khi test mong đợi chuỗi tiếng Anh ("Invalid email or password."). |
| `dotnet test ...Ecommerce.WebAPI.IntegrationTests.csproj` | Local Windows | ✅ **PASS (từng fixture)** | Fixture `Phase0RuntimeHardeningTests` pass 5/5 trong 1m11s. Chạy toàn bộ suite mất ~7 phút do mỗi fixture đều khởi động web app và chạy seeder 2,923 dòng code trong SQLite. |
| `npm --prefix ecommerce-client run typecheck` | Local Windows | ✅ **PASS (0 errors)** | `tsc --noEmit` hoàn tất thành công. |
| `npm --prefix ecommerce-dashboard run typecheck` | Local Windows | ✅ **PASS (0 errors)** | `tsc --noEmit` hoàn tất thành công. |
| `npm --prefix ecommerce-client run lint` | Local Windows | ✅ **PASS (0 errors, 0 warnings)** | ESLint 9 chạy sạch. |
| `npm --prefix ecommerce-dashboard run lint` | Local Windows | ⚠️ **WARNING (0 errors, 76 warnings)** | 76 warnings `@typescript-eslint/no-explicit-any` tại hooks, services và types. |

---

## 6. Các thành phần chưa rõ mục đích, Dead Code hoặc Test Scaffolding

1. **`WeatherForecastController.cs`**: File controller mẫu của template ASP.NET Core vẫn được giữ lại tại `Ecommerce.WebAPI/Controllers/WeatherForecastController.cs` (có gắn `[DevelopmentOnly]`).
2. **`TestStorageController.cs`**: Controller phục vụ test upload Supabase tại `Ecommerce.WebAPI/Controllers/TestStorageController.cs` (có gắn `[DevelopmentOnly]`).
3. **Thư mục rỗng `Ecommerce.Infrastructure/Persistence/Migrations`**: Toàn bộ migration thực tế nằm ở `Ecommerce.Infrastructure/Migrations`, thư mục này để trống gây nhầm lẫn cấu trúc.
4. **`wwwroot/uploads/` được commit vào Git**: Hơn 70 file ảnh tĩnh mẫu kích thước lớn nằm trong Git tracking, trái với quy ước tại `AGENTS.md`.
5. **Storybook configuration dở dang**: `@storybook/react` có mặt trong `ecommerce-dashboard/package.json` nhưng không có scripts `storybook` trong `scripts` của `package.json`.
