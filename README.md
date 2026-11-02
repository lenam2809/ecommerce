Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# ShopViet E-Commerce Platform

## 1. Tổng quan dự án

### Mục tiêu
Xây dựng nền tảng thương mại điện tử chuyên biệt cho ngành bán lẻ công nghệ tại thị trường Việt Nam (Vietnamese tech market) bao gồm website mua sắm cho khách hàng và trang quản trị toàn diện cho quản trị viên. Hệ thống hỗ trợ đầy đủ các chức năng từ duyệt sản phẩm, so sánh thông số kỹ thuật, giỏ hàng, đặt cọc COD, thanh toán VNPay, quản lý kho IMEI/Serial, mạng lưới 45 showroom đến quản trị đổi trả hàng (RMA) và báo cáo doanh thu.

### Phân hệ ứng dụng
- **Backend API**: ASP.NET Core 8 REST API theo kiến trúc Clean Architecture, Domain-Driven Design (DDD) và CQRS (36 Controllers).
- **ecommerce-client**: Website mua sắm cho khách hàng xây dựng trên Next.js 15 (React 19), Tailwind CSS v4 (27 routes).
- **ecommerce-dashboard**: Trang quản trị hệ thống cho admin và nhân viên xây dựng trên Next.js 15 (React 18.3.1), Tailwind CSS v4, TanStack Table v8 (71 routes).

### Đối tượng sử dụng
| Đối tượng | Mô tả | Ứng dụng |
|-----------|-------|----------|
| **Guest (Khách vãng lai)** | Xem sản phẩm, so sánh cấu hình, thêm giỏ hàng (Guest Cart lưu server-side cookie 7 ngày), đặt hàng không cần đăng ký | ecommerce-client |
| **Customer (Thành viên)** | Mua hàng, tích điểm thành viên, quản lý sổ địa chỉ, tạo yêu cầu đổi trả (RMA 7 ngày), wishlist, đánh giá sản phẩm | ecommerce-client |
| **Admin & Staff (Quản trị viên & Nhân viên)** | Quản lý sản phẩm, tồn kho IMEI/Serial, duyệt đơn, showroom, đổi trả RMA, khóa tài khoản, báo cáo | ecommerce-dashboard |

---

## 2. Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|------------|-----------|
| Framework | .NET 8.0 (ASP.NET Core Web API) |
| Kiến trúc | Clean Architecture + DDD + CQRS với MediatR |
| Controllers | 36 REST Controllers |
| Domain Entities | 67 Domain Entities + 1 BaseEntity (68 classes), 20 Enums |
| ORM | Entity Framework Core 8 |
| Database | PostgreSQL 16 (Docker/Render) / SQLite (Local dev nhanh) — *Không hỗ trợ SQL Server* |
| Caching | Redis 7 (optional, fallback in-memory cache) |
| Message Broker | RabbitMQ 3.13 (Domain Events, Outbox Pattern) |
| Search | Elasticsearch 8.13/8.16 (optional, fallback SQL LIKE qua `NoOpProductSearchService`) |
| Authentication | JWT + httpOnly Cookie (dual authentication), CSRF Token, Redis session |
| Real-time | SignalR WebSocket (Hubs: `NotificationHub`, `ReviewHub`) |
| Payments | VNPay Sandbox & COD (Backend xử lý thực tế); MoMo, ZaloPay, VietQR (Frontend UI) |
| Background Jobs | Hosted Services: `EmailBackgroundService`, `OutboxBackgroundService` |
| Logging & Metrics | Serilog, OpenTelemetry, Jaeger, Prometheus, Alertmanager, Grafana |
| Testing | 3 test projects với 55 test files (`Application.Tests`, `Domain.Tests`, `IntegrationTests`) |

### Frontend
| Thành phần | ecommerce-client | ecommerce-dashboard |
|------------|------------------|---------------------|
| Framework | Next.js `^15.5.14` | Next.js `^15.5.14` |
| React | React `^19.0.0` | React `^18.3.1` |
| Routes / Màn hình | **27 routes** | **71 routes** |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 |
| UI Components | Radix UI, Lucide Icons | Radix UI, Tabler Icons, Lucide Icons |
| State Management | TanStack Query v5 | TanStack Query v5 |
| Forms & Validation | React Hook Form + Zod | React Hook Form + Zod |
| Data Table | - | TanStack Table v8 |
| Charts | - | Recharts |
| Drag & Drop | - | @dnd-kit |

### DevOps & Hạ tầng (11 Dịch vụ Docker Compose)
| Dịch vụ | Image / Công nghệ | Cổng mặc định | Vai trò |
|---------|-------------------|---------------|---------|
| `postgres` | postgres:15-alpine / 16-alpine | 5432:5432 | Cơ sở dữ liệu chính |
| `redis` | redis:7-alpine | 6379:6379 | Bộ nhớ đệm phân tán |
| `rabbitmq` | rabbitmq:3.13-management-alpine | 5672:5672, 15672:15672 | Message broker cho Outbox events |
| `elasticsearch` | ecommerce-elasticsearch-icu:8.16.3 | 9200:9200 | Tìm kiếm full-text sản phẩm tiếng Việt |
| `backend` | ASP.NET Core 8 Web API | 5000:5000 | Backend REST API |
| `frontend-client` | Next.js 15 (React 19) | 3000:3000 | Giao diện khách hàng |
| `frontend-dashboard` | Next.js 15 (React 18.3.1) | 3001:3000 | Giao diện quản trị |
| `jaeger` | jaegertracing/all-in-one:1.57 | 16686:16686, 4317:4317 | Distributed tracing APM |
| `prometheus` | prom/prometheus:v2.52.0 | 9090:9090 | Thu thập số liệu hiệu năng |
| `alertmanager` | prom/alertmanager:v0.27.0 | 9093:9093 | Quản lý thông báo cảnh báo |
| `grafana` | grafana/grafana:10.4.3 | 3002:3000 | Dashboard trực quan hóa giám sát |

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │     ecommerce-client        │    │       ecommerce-dashboard           │ │
│  │     Next.js 15 (React 19)   │    │     Next.js 15 (React 18.3.1)       │ │
│  │     Port: 3000 (27 routes)  │    │     Port: 3001 (71 routes)          │ │
│  │     Customer Website        │    │     Admin Panel                     │ │
│  └──────────────┬──────────────┘    └─────────────────┬───────────────────┘ │
│                 │                                      │                     │
│                 │      HTTP/REST (Cookie/CSRF) + SignalR                     │
│                 └──────────────────┬───────────────────┘                     │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │               Ecommerce.WebAPI (ASP.NET Core 8 - 36 Controllers)        ││
│  │               Port: 5000                                                ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  ┌──────────────┐  ││
│  │  │ Controllers │  │ Middleware  │  │  SignalR Hubs │  │ Outbox Worker│  ││
│  │  └──────┬──────┘  └─────────────┘  └───────────────┘  └──────────────┘  ││
│  └─────────┼───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │               Ecommerce.Application (CQRS Commands & Queries)           ││
│  │  Features: Auth, Products, Cart, Orders, Payments, Returns, Inventory... ││
│  └─────────┬───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │               Ecommerce.Domain (DDD Core)                               ││
│  │  67 Entities, 20 Enums, Domain Events, Aggregate Roots, Interfaces      ││
│  └─────────┬───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │               Ecommerce.Infrastructure (Persistence & External)         ││
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐ ││
│  │  │  DbContext   │ │6Migrations │ │ SignalR  │ │   Cache   │ │  VNPay  │ ││
│  │  │(Postgres/Sql)│ │  (EF Core) │ │  Hubs    │ │ (InMem/Rd)│ │ Gateway │ ││
│  │  └──────────────┘ └────────────┘ └──────────┘ └───────────┘ └─────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA & INFRA LAYER                             │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │ PostgreSQL 16 (or SQLite)   │    │ Redis 7 (Optional Cache)            │ │
│  │ Database: ecommerce_db      │    │ Port: 6379                          │ │
│  ├─────────────────────────────┤    ├─────────────────────────────────────┤ │
│  │ RabbitMQ 3.13 (Broker)      │    │ Elasticsearch 8.16 (Search)         │ │
│  │ Port: 5672 / 15672          │    │ Port: 9200                          │ │
│  ├─────────────────────────────┤    ├─────────────────────────────────────┤ │
│  │ Jaeger Tracing (4317/16686) │    │ Prometheus & Grafana (9090/3002)    │ │
│  └─────────────────────────────┘    └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Cấu trúc thư mục

```
ecommerce/
├── apps/
│   ├── backend/
│   │   └── Ecommerce/                    # .NET Solution
│   │       ├── Ecommerce.sln
│   │       ├── Dockerfile
│   │       ├── Ecommerce.Domain/         # Domain Layer (67 Entities, 20 Enums)
│   │       │   ├── Entities/             # Product, Order, ReturnRequest, InventoryItem...
│   │       │   ├── Enums/                # EOrderStatus, EReturnStatus, EInventoryStatus...
│   │       │   ├── Events/               # Domain Events
│   │       │   └── Interfaces/           # Repository Abstractions
│   │       ├── Ecommerce.Application/    # Application Layer (CQRS)
│   │       │   ├── Features/             # CQRS Feature slices (36 business modules)
│   │       │   ├── Common/               # DTOs, Mappings, FluentValidation, Configs
│   │       │   └── Services/             # ShippingCalculator, CustomerLevel...
│   │       ├── Ecommerce.Infrastructure/ # Infrastructure Layer
│   │       │   ├── Persistence/          # DbContext (PostgreSQL/SQLite), Seed Data
│   │       │   ├── Migrations/           # 6 EF Core Migrations
│   │       │   ├── SignalR/              # NotificationHub, ReviewHub
│   │       │   ├── Cache/                # Redis / In-memory Cache
│   │       │   ├── Payments/             # VNPay Sandbox Payment Gateway
│   │       │   ├── EmailTemplates/       # HTML Email Templates (order, status, reset)
│   │       │   └── Services/             # EmailBackgroundService, OutboxBackgroundService
│   │       ├── Ecommerce.WebAPI/         # Presentation Layer (36 Controllers)
│   │       │   ├── Controllers/          # 36 REST API Controllers
│   │       │   ├── Middleware/           # CSRF, Logging, Exception, GuestCart, AccountLock
│   │       │   ├── Extensions/           # Service & Database Registration Extensions
│   │       │   ├── appsettings.json      # Configuration
│   │       │   └── Program.cs            # Application Entry Point
│   │       └── TemplateEngineHost/       # Cache nội bộ của Visual Studio template engine (vs/)
│   └── frontend/
│       ├── ecommerce-client/             # Customer Storefront (Next.js 15, React 19, 27 routes)
│       │   ├── app/                      # App Router: (auth)/, (routes)/
│       │   ├── components/               # Bento Grid, ProductCard, Cart, Checkout, RMA
│       │   ├── hooks/                    # TanStack Query custom hooks
│       │   ├── services/                 # Axios API services
│       │   ├── types/                    # TypeScript interfaces
│       │   └── hubs/                     # SignalR connection
│       └── ecommerce-dashboard/          # Admin Dashboard (Next.js 15, React 18.3.1, 71 routes)
│           ├── app/                      # App Router: (auth)/, (dashboard)/
│           ├── components/               # TanStack Table, Recharts, Form Dialogs
│           ├── hooks/                    # Admin query hooks
│           ├── services/                 # Admin API client services
│           └── config/                   # Navigation & Menu configurations
├── tests/
│   ├── Ecommerce.Application.Tests/      # 30 test files (CQRS, validation, services)
│   ├── Ecommerce.Domain.Tests/           # 12 test files (Domain entities, order flow, inventory)
│   └── Ecommerce.WebAPI.IntegrationTests/# 13 test files (API integration, auth, outbox, payments)
├── docker-compose/
│   ├── docker-compose.yml                # 11 dịch vụ hoàn chỉnh
│   ├── .env.example                      # Template biến môi trường
│   └── observability/                    # Cấu hình Prometheus, Alertmanager, Grafana
├── .github/
│   └── workflows/
│       └── frontend-quality.yml          # CI/CD: Typecheck, Lint, Build Client & Dashboard
└── docs/                                 # Tài liệu kiến trúc và hướng dẫn nghiệp vụ
```

---

## 5. Hướng dẫn cài đặt & chạy dự án (Local)

### Yêu cầu môi trường
- **.NET SDK**: 8.0
- **Node.js**: v18.x hoặc cao hơn (khuyến nghị v20.x LTS)
- **Cơ sở dữ liệu**: Docker (chạy PostgreSQL) HOẶC không cần cài gì (dùng SQLite cục bộ)
- **Git**

> [!NOTE]
> Hệ thống **hoàn toàn không hỗ trợ Microsoft SQL Server**. Bạn có thể lựa chọn 1 trong 2 phương án bên dưới để chạy local nhanh chóng.

### Phương án 1: Dùng Docker Compose cho Hạ tầng (Khuyến nghị)
Khởi động cụm dịch vụ cơ bản (PostgreSQL, Redis, RabbitMQ):
```bash
cd docker-compose
docker compose up -d postgres redis rabbitmq
```
Connection string PostgreSQL mặc định:
`Host=localhost;Port=5432;Database=ecommerce_db;Username=postgres;Password=yourpassword;`

### Phương án 2: Chạy SQLite Độc lập (Không cần Docker)
Chỉ cần cấu hình connection string trong `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ecommerce.db"
  }
}
```
Lớp `AddDatabaseExtensions.cs` sẽ tự động kích hoạt SQLite provider và tự động tạo database file `ecommerce.db` tại chỗ khi khởi động.

---

### Khởi chạy Backend (.NET 8 WebAPI)
```bash
cd apps/backend/Ecommerce
dotnet restore

# Chạy toàn bộ 55 test files trên 3 dự án kiểm thử
dotnet test

# Khởi chạy WebAPI
dotnet run --project Ecommerce.WebAPI
```
- API & Swagger UI: `http://localhost:5000/swagger`
- CSDL tự động migrate và seed dữ liệu mẫu (admin, 4 roles, 45 showroom, danh mục, sản phẩm công nghệ) trong môi trường Development.

---

### Khởi chạy Frontend Client (Website Khách hàng)
```bash
cd apps/frontend/ecommerce-client
npm install
npm run dev
```
Client chạy tại cổng **3000**: `http://localhost:3000`

Scripts kiểm tra chất lượng:
```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # next build
```

---

### Khởi chạy Frontend Dashboard (Trang Quản trị)
```bash
cd apps/frontend/ecommerce-dashboard
npm install
npm run dev -- -p 3001
```
Dashboard chạy tại cổng **3001**: `http://localhost:3001`

Scripts kiểm tra chất lượng:
```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run build      # next build
```

---

### Bảng Ports Hệ thống
| Dịch vụ | Cổng | URL truy cập |
|---------|------|--------------|
| Backend REST API | 5000 | http://localhost:5000 |
| Backend Swagger UI | 5000 | http://localhost:5000/swagger |
| Frontend Client | 3000 | http://localhost:3000 |
| Frontend Dashboard | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| RabbitMQ Management UI | 15672 | http://localhost:15672 (guest/guest) |
| Elasticsearch | 9200 | http://localhost:9200 |
| Jaeger UI | 16686 | http://localhost:16686 |
| Prometheus | 9090 | http://localhost:9090 |
| Alertmanager | 9093 | http://localhost:9093 |
| Grafana | 3002 | http://localhost:3002 (admin/admin) |

---

## 6. Cấu hình môi trường

### Backend (appsettings.Development.json)
Tham khảo file mẫu `apps/backend/Ecommerce/Ecommerce.WebAPI/appsettings.Development.example.json`.

| Biến cấu hình | Ý nghĩa & Giá trị mẫu | Bắt buộc |
|---|---|:---:|
| `ConnectionStrings:DefaultConnection` | `Data Source=ecommerce.db` (SQLite) hoặc PostgreSQL string | ✅ |
| `ConnectionStrings:Redis` | `localhost:6379` | ❌ (Fallback Memory) |
| `Jwt:SecretKey` | Chuỗi khóa bí mật JWT $\ge 32$ ký tự (`CHANGE_ME_MINIMUM_32_CHARACTERS`) | ✅ |
| `Jwt:Issuer` | `Ecommerce` | ✅ |
| `Jwt:Audience` | `EcommerceUsers` | ✅ |
| `Jwt:AccessTokenExpirationMinutes` | Thời hạn claim JWT (mặc định 60 phút) | ✅ |
| `AuthConfig:UseCookieAuth` | `true` (Xác thực qua httpOnly cookie) | ✅ |
| `AuthConfig:EnableCsrfProtection` | `true` (Bảo vệ CSRF với header `X-CSRF-Token`) | ✅ |
| `CookieSettings:AccessTokenMinutes` | `15` (Thời hạn cookie access_token phía trình duyệt) | ✅ |
| `CookieSettings:RefreshTokenDays` | `7` (Thời hạn cookie refresh_token) | ✅ |
| `Auth:TokenHashSecret` | Secret hashing token (`CHANGE_ME_SEPARATE_TOKEN_HASH_SECRET_MIN_32_CHARS`) | ✅ |
| `VnPay:TmnCode` | Terminal Code VNPay Sandbox | ❌ |
| `VnPay:HashSecret` | Khóa bí mật băm dữ liệu VNPay Sandbox | ❌ |
| `VnPay:BaseUrl` | `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html` | ❌ |
| `VnPay:ReturnUrl` | `http://localhost:5000/api/payments/vnpay/return` | ❌ |
| `Elasticsearch:UseElasticsearch` | `false` (local fallback sang SQL LIKE) | ❌ |
| `FileStorage:UploadFolder` | `uploads` | ✅ |

### Frontend Client & Dashboard (.env.local)
- Client: Tham khảo `apps/frontend/ecommerce-client/.env.example`
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
  NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
  ```
- Dashboard: Tham khảo `apps/frontend/ecommerce-dashboard/.env.example`
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
  NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000
  GEMINI_API_KEY=your-gemini-api-key
  ```

---

## 7. Chức năng chính & Quy chuẩn SSoT 2026

### Quy tắc Nghiệp vụ Chuẩn SSoT 2026
1. **Mạng lưới 45 Showroom**: Hệ thống tích hợp danh mục 45 showroom công nghệ hiện đại toàn quốc kèm kiểm tra tồn kho tại chỗ và dịch vụ nhận tại cửa hàng (`ShowroomPickup`).
2. **Hotlines Miễn phí Cước**: Hotline bán hàng `1800 6868` và Hotline kỹ thuật `1800 6869`.
3. **Chính sách Freeship**: Áp dụng miễn phí vận chuyển cho đơn hàng từ **500.000₫** trở lên. Đơn dưới 500k tính phí cố định 30.000₫. Mã voucher `FREESHIP` giảm 100% phí ship.
4. **Cọc COD 10% cho Đơn hàng Giá trị cao**: Đơn hàng chọn phương thức COD có tổng giá trị `TotalAmount > 20.000.000₫` (lớn hơn 20 triệu đồng) bắt buộc phải đặt cọc trước **10%** (`DepositRequired = Math.Round(TotalAmount * 0.10m)`), 90% còn lại thu khi giao hàng. Trạng thái cọc ban đầu là `Pending`.
5. **Quy trình Đổi trả hàng (RMA)**: Thời hạn gửi yêu cầu đổi trả là **7 ngày** kể từ ngày giao hàng thành công (`Delivered`).

### Vòng đời & Chuyển trạng thái Đơn hàng (Order State Transitions)
Chuỗi trạng thái chuẩn trong Domain (`Order.cs`):
```
[Pending = 0] ───> [Processing = 1] ───> [Shipped = 2] ───> [Delivered = 6] ───> [Completed = 3]
       │                    │                                      │
       └───> [Cancelled = 4] <──┘                                  └──> [ReturnRequested = 7]
                                                                                │
                                                                                ▼
                                                                        [Returned = 8]
                                                                                │
                                                                                ▼
                                                                        [Refunded = 5]
```
> [!WARNING]
> Tuyệt đối không nhảy cóc từ `Shipped` trực tiếp sang `Completed` (bắt buộc phải qua trạng thái `Delivered`). Mọi bước chuyển sai quy trình sẽ ném ngoại lệ `InvalidStatusTransitionException`.

---

## 8. Xác thực & Bảo mật

Hệ thống triển khai cơ chế xác thực kép an toàn:
1. **Access Token**: JWT claim tồn tại 60 phút, tuy nhiên Cookie trình duyệt `access_token` được cấu hình thu hồi sau **15 phút** (`httpOnly`, `Secure`, `SameSite=Lax`).
2. **Refresh Token**: Cookie `refresh_token` tồn tại **7 ngày** dùng để xoay vòng access token mới mà không bắt người dùng đăng nhập lại.
3. **Bảo vệ CSRF**: Header `X-CSRF-Token` bắt buộc trên các request `POST`, `PUT`, `DELETE`.
4. **Guest Cart**: Khách vãng lai sử dụng server-side httpOnly cookie `guest_id` thời hạn 7 ngày sinh từ `GuestCartMiddleware`. Dữ liệu giỏ hàng lưu trực tiếp trong CSDL (bảng `Carts` qua cột `AnonymousId`), tự động merge vào tài khoản khi người dùng đăng nhập.

---

## 9. Lịch sử EF Core Migrations

Hệ thống sở hữu **6 migrations** chính thức:
1. `20260507115052_InitialCreate.cs` — Khởi tạo toàn bộ cấu trúc CSDL ban đầu.
2. `20260516123045_AddReviewProductUserUniqueIndex.cs` — Unique index đánh giá sản phẩm.
3. `20260517012236_AddOutboxMessages.cs` — Bảng lưu trữ Outbox Pattern cho Domain Events.
4. `20261015140903_RefactorCartItemSurrogateKey.cs` — Tái cấu trúc surrogate key bảng giỏ hàng.
5. `20261020155436_AddTechEcommerceSchema2026.cs` — Bổ sung IMEI inventory, RMA returns, marquee, account locks.
6. `20261021121358_AddTechEcommerceSpecsAndShowrooms2026.cs` — Bổ sung bảng 45 Showrooms, tồn kho chi nhánh, thông số kỹ thuật chi tiết, phụ kiện add-ons.

Lệnh thêm migration và update CSDL:
```bash
cd apps/backend/Ecommerce
dotnet ef migrations add <MigrationName> --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
dotnet ef database update --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
```

---

## 10. Kiểm thử tự động & Chất lượng mã nguồn

Hệ thống có bộ kiểm thử tự động toàn diện với **3 test projects** và **55 test files**:
- `Ecommerce.Application.Tests` (30 test files): Kiểm thử nghiệp vụ CQRS, MediatR handlers, validation rules, caching policy, outbox processor.
- `Ecommerce.Domain.Tests` (12 test files): Kiểm thử logic thực thể, chuyển trạng thái đơn hàng, cọc COD, serial kho IMEI.
- `Ecommerce.WebAPI.IntegrationTests` (13 test files): Kiểm thử tích hợp WebApplicationFactory, luồng thanh toán VNPay, khôi phục tồn kho nguyên tử, phân quyền RBAC.

Lệnh chạy toàn bộ kiểm thử:
```bash
cd apps/backend/Ecommerce
dotnet test
```

Quy trình CI/CD GitHub Actions:
- Workflow `.github/workflows/frontend-quality.yml` tự động kiểm tra typecheck, linting và build dự án trên mỗi pull request vào nhánh chính.

---

## 11. Sai lệch đã biết (Known Discrepancies)

Các điểm sai lệch giữa mã nguồn hiện tại và tài liệu thiết kế được ghi nhận để các kỹ sư và AI Assistant nắm rõ:
1. **Ngưỡng Freeship:**
   - Chuẩn nghiệp vụ (SSoT) và Frontend (`CartHeader.tsx`, `OrderSummary.tsx`): Miễn phí vận chuyển khi `subtotal >= 500.000₫`.
   - Backend (`ShippingCalculator.cs:34`): Đang dùng toán tử `>` (`subtotal > FREE_SHIPPING_THRESHOLD`). Do đó, đơn hàng có giá trị đúng 500.000₫ tại backend vẫn bị tính phí 30.000₫.
2. **Thời hạn Token vs Cookie Auth:**
   - Payload JWT claim (`TokenService.cs:54`): Sinh ra thời hạn hết hạn là 60 phút (`AccessTokenExpirationMinutes`).
   - Cookie trình duyệt (`CookieAuthExtensions.cs:36`): Thiết lập `Expires` theo cấu hình `CookieSettings:AccessTokenMinutes` (15 phút). Trình duyệt sẽ tự thu hồi cookie sau 15 phút dù JWT bên trong còn hiệu lực.
3. **Cổng thanh toán MoMo, ZaloPay, VietQR:**
   - Frontend Client (`payment-method.tsx`): Cung cấp các nút tùy chọn ví MoMo, ZaloPay, VietQR Pro.
   - Backend (`PaymentsController.cs`): Chưa có webhook/IPN tích hợp cho các cổng này, chỉ lưu tên phương thức vào database. Chỉ có COD và VNPay là được xử lý nghiệp vụ trọn vẹn.
4. **Secret cấu hình cũ lộ trong Git History:**
   - Commit `695e86f84c15` (01/04/2026) từng đưa trực tiếp cấu hình chứa secret VNPay sandbox và connection string vào git.
   - Commit `0b346f35aaf0` (08/04/2026) đã xóa các file này khỏi git và đưa vào `.gitignore`, tuy nhiên secret vẫn còn lưu trong lịch sử commit (khuyến nghị thu hồi và cấp lại cặp khóa mới).
5. **Lệch Enum trạng thái đơn hàng tại Frontend Client:**
   - Backend `EOrderStatus`: Gồm 9 trạng thái (`Pending=0`, `Processing=1`, `Shipped=2`, `Completed=3`, `Cancelled=4`, `Refunded=5`, `Delivered=6`, `ReturnRequested=7`, `Returned=8`).
   - Client (`types/order.ts`): Chỉ định nghĩa 6 trạng thái và gán `Delivered=3` (thay vì `6`), thiếu `Completed` và `Refunded`.
