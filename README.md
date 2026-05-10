# ShopViet E-Commerce Platform

## 1. Tổng quan dự án

### Mục tiêu
Xây dựng hệ thống thương mại điện tử (E-commerce) hoàn chỉnh bao gồm website mua sắm cho khách hàng và trang quản trị cho admin. Hệ thống hỗ trợ đầy đủ các chức năng từ duyệt sản phẩm, giỏ hàng, thanh toán đến quản lý đơn hàng và báo cáo doanh thu.

### Loại hình hệ thống
- **E-commerce Storefront**: Website mua sắm cho người dùng cuối
- **Admin Dashboard**: Trang quản trị hệ thống

### Đối tượng sử dụng
| Đối tượng | Mô tả | Ứng dụng |
|-----------|-------|----------|
| **Guest (Khách vãng lai)** | Xem sản phẩm, thêm giỏ hàng, thanh toán không cần đăng nhập | ecommerce-client |
| **Customer (Thành viên)** | Mua hàng, quản lý đơn hàng, wishlist, viết đánh giá | ecommerce-client |
| **Admin (Quản trị viên)** | Quản lý sản phẩm, đơn hàng, người dùng, báo cáo | ecommerce-dashboard |

---

## 2. Công nghệ sử dụng

### Backend
| Thành phần | Công nghệ |
|------------|-----------|
| Framework | .NET 8.0 (ASP.NET Core Web API) |
| Kiến trúc | Clean Architecture + DDD |
| Pattern | CQRS với MediatR |
| ORM | Entity Framework Core |
| Authentication | JWT + Cookie-based Auth + CSRF Protection |
| Real-time | SignalR (Hub: Notification, Review) |
| Logging | Serilog |
| Excel Export | EPPlus |

### Frontend
| Thành phần | ecommerce-client | ecommerce-dashboard |
|------------|------------------|---------------------|
| Framework | Next.js 15.2 | Next.js 15.3 |
| React | React 19 | React 18 |
| Styling | Tailwind CSS v4 | Tailwind CSS v4 |
| UI Components | Radix UI, Lucide Icons | Radix UI, Tabler Icons, Lucide Icons |
| State Management | TanStack Query v5 | TanStack Query v5 |
| Forms | React Hook Form + Zod | React Hook Form + Zod |
| Animations | Framer Motion | - |
| Data Table | - | TanStack Table |
| Charts | - | Recharts |
| Drag & Drop | - | @dnd-kit |

### Database
- **Primary**: SQL Server (chạy local, không container)
- **Cache**: Redis (optional, qua Docker)

### DevOps
- **Containerization**: Docker, Docker Compose
- **Services**: Backend API, Frontend Client, Frontend Dashboard, Redis

### Dịch vụ bên thứ ba
| Dịch vụ | Mô tả |
|---------|-------|
| **VNPay** | Cổng thanh toán trực tuyến (Sandbox) |
| **SignalR** | Real-time notifications |

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │     ecommerce-client        │    │       ecommerce-dashboard           │ │
│  │     (Next.js 15.2)          │    │         (Next.js 15.3)              │ │
│  │     Port: 3000              │    │         Port: 3001                  │ │
│  │     Customer Website        │    │         Admin Panel                 │ │
│  └──────────────┬──────────────┘    └─────────────────┬───────────────────┘ │
│                 │                                      │                     │
│                 │         HTTP/REST + SignalR          │                     │
│                 └──────────────────┬───────────────────┘                     │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                        Ecommerce.WebAPI                                 ││
│  │                        Port: 5000                                       ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  ┌──────────────┐ ││
│  │  │ Controllers │  │ Middleware  │  │  SignalR Hubs │  │    CORS      │ ││
│  │  └──────┬──────┘  └─────────────┘  └───────────────┘  └──────────────┘ ││
│  └─────────┼───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │                     Ecommerce.Application                               ││
│  │  ┌────────────────────────────────────────────────────────────────────┐ ││
│  │  │     Features (CQRS: Commands + Queries + Handlers)                 │ ││
│  │  │  Auth, Products, Cart, Orders, Payments, Reviews, Notifications... │ ││
│  │  └────────────────────────────────────────────────────────────────────┘ ││
│  └─────────┬───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │                       Ecommerce.Domain                                  ││
│  │      Entities, Enums, Events, Interfaces (Repository Abstractions)     ││
│  └─────────┬───────────────────────────────────────────────────────────────┘│
│            │                                                                 │
│  ┌─────────▼───────────────────────────────────────────────────────────────┐│
│  │                    Ecommerce.Infrastructure                             ││
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐            ││
│  │  │ Persistence  │ │ Migrations │ │ SignalR  │ │   Cache   │            ││
│  │  │ (DbContext)  │ │            │ │  Hubs    │ │  (Redis)  │            ││
│  │  └──────────────┘ └────────────┘ └──────────┘ └───────────┘            ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │      SQL Server (Local)     │    │       Redis (Docker - Optional)    │ │
│  │      Database: ecommerce_db │    │       Port: 6379                   │ │
│  └─────────────────────────────┘    └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Cách các thành phần giao tiếp
1. **Frontend → Backend**: RESTful API qua HTTP (JSON), hỗ trợ Cookie-based authentication
2. **Real-time**: SignalR WebSocket cho notifications và live reviews
3. **Backend → Database**: Entity Framework Core với SQL Server
4. **Caching**: Memory Cache (mặc định) hoặc Redis (optional)

---

## 4. Cấu trúc thư mục

```
ecommerce/
├── apps/
│   ├── backend/
│   │   └── Ecommerce/                    # .NET Solution
│   │       ├── Ecommerce.sln
│   │       ├── Dockerfile
│   │       ├── Ecommerce.Domain/         # Domain Layer
│   │       │   ├── Entities/             # 45 entity classes (Product, Order, Cart...)
│   │       │   ├── Enums/                # OrderStatus, PaymentMethod...
│   │       │   ├── Events/               # Domain Events
│   │       │   └── Interfaces/           # Repository interfaces
│   │       ├── Ecommerce.Application/    # Application Layer
│   │       │   ├── Features/             # 26 feature modules (CQRS)
│   │       │   │   ├── Auth/             # Login, Register, RefreshToken
│   │       │   │   ├── Products/         # CRUD, Search, Filter
│   │       │   │   ├── Cart/             # Guest Cart, User Cart
│   │       │   │   ├── Orders/           # Create, Update Status
│   │       │   │   ├── Payments/         # VNPay integration
│   │       │   │   └── ...
│   │       │   ├── Common/               # DTOs, Mappings, Validators
│   │       │   └── Policies/             # Authorization policies
│   │       ├── Ecommerce.Infrastructure/ # Infrastructure Layer
│   │       │   ├── Persistence/          # DbContext, Repositories, Seed
│   │       │   ├── Migrations/           # EF Core Migrations
│   │       │   ├── SignalR/              # NotificationHub, ReviewHub
│   │       │   ├── Cache/                # Redis Cache implementation
│   │       │   └── Services/             # External services
│   │       └── Ecommerce.WebAPI/         # Presentation Layer
│   │           ├── Controllers/          # 26 API controllers
│   │           ├── Middleware/           # CSRF, Logging, Exception
│   │           ├── Extensions/           # Service extensions
│   │           ├── appsettings.json      # Configuration
│   │           └── Program.cs            # Entry point
│   └── frontend/
│       ├── ecommerce-client/             # Customer Website (Next.js)
│       │   ├── app/                      # App Router pages
│       │   │   ├── (auth)/               # Login, Register
│       │   │   └── (routes)/             # Products, Cart, Checkout...
│       │   ├── components/               # UI Components
│       │   ├── hooks/                    # Custom React Hooks
│       │   ├── services/                 # API services
│       │   ├── types/                    # TypeScript types
│       │   └── hubs/                     # SignalR connection
│       └── ecommerce-dashboard/          # Admin Dashboard (Next.js)
│           ├── app/
│           │   ├── (auth)/               # Admin login
│           │   └── (dashboard)/          # Dashboard, Products, Orders...
│           ├── components/               # Admin UI Components
│           ├── hooks/                    # Admin hooks
│           ├── services/                 # Admin API services
│           └── config/                   # Dashboard configurations
├── docker-compose/
│   ├── docker-compose.yml                # Multi-service compose file
│   ├── .env.example                      # Environment template
│   └── .env                              # Local environment (gitignored)
└── docs/
    ├── business_requirements.md          # Business requirements
    ├── authentication_proposal.md        # Auth improvement proposal
    ├── DOCKER_GUIDE.md                   # Docker deployment guide
    └── security/                         # Security documentation
```

---

## 5. Hướng dẫn cài đặt & chạy dự án (Local)

### Yêu cầu môi trường
- **Node.js**: v18.x hoặc cao hơn
- **.NET SDK**: 8.0
- **SQL Server**: 2019 hoặc cao hơn (có thể dùng SQL Server Express)
- **Docker Desktop**: (tùy chọn, cho Redis và deployment)
- **Git**

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd ecommerce
```

### Bước 2: Cấu hình Database
1. Tạo database `ecommerce_db` trong SQL Server
2. Đảm bảo SQL Server cho phép Windows Authentication hoặc SQL Authentication

### Bước 3: Cấu hình Backend
```bash
cd apps/backend/Ecommerce/Ecommerce.WebAPI
```

Cập nhật `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ecommerce_db;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

### Bước 4: Chạy Backend
```bash
cd apps/backend/Ecommerce
dotnet restore
dotnet run --project Ecommerce.WebAPI
```
Backend sẽ chạy tại: `http://localhost:5000`

> **Lưu ý**: Database sẽ được tự động migrate và seed data khi khởi động lần đầu.

### Bước 5: Chạy Frontend Client
```bash
cd apps/frontend/ecommerce-client
npm install
npm run dev
```
Client sẽ chạy tại: `http://localhost:3000`

### Bước 6: Chạy Frontend Dashboard
```bash
cd apps/frontend/ecommerce-dashboard
npm install
npm run dev
```
Dashboard sẽ chạy tại: `http://localhost:3001`

### Ports sử dụng
| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Swagger | 5000 | http://localhost:5000/swagger |
| Client Website | 3000 | http://localhost:3000 |
| Admin Dashboard | 3001 | http://localhost:3001 |
| Redis (Optional) | 6379 | localhost:6379 |

---

## 6. Cấu hình môi trường

### Backend (appsettings.Development.json)

| Biến | Mô tả | Bắt buộc |
|------|-------|----------|
| `ConnectionStrings:DefaultConnection` | Connection string SQL Server | ✅ |
| `ConnectionStrings:Redis` | Redis connection (nếu dùng) | ❌ |
| `Jwt:SecretKey` | Secret key cho JWT (min 32 chars) | ✅ |
| `Jwt:Issuer` | JWT Issuer | ✅ |
| `Jwt:Audience` | JWT Audience | ✅ |
| `Jwt:AccessTokenExpirationMinutes` | Thời hạn access token | ✅ |
| `FileStorage:AppUrl` | URL base của backend | ✅ |
| `FileStorage:UploadFolder` | Thư mục lưu file upload | ✅ |
| `CacheSettings:UseRedis` | Bật/tắt Redis cache | ❌ |
| `VnPay:TmnCode` | VNPay Terminal Code | ❌ |
| `VnPay:HashSecret` | VNPay Secret Key | ❌ |
| `AuthConfig:UseCookieAuth` | Bật cookie-based auth | ✅ |
| `AuthConfig:EnableCsrfProtection` | Bật CSRF protection | ✅ |
| `CookieSettings:AccessTokenMinutes` | Cookie access token TTL | ✅ |
| `CookieSettings:RefreshTokenDays` | Cookie refresh token TTL | ✅ |
| `Authentication:Google:ClientId` | Google OAuth client id for customer sign-in | ❌ |
| `Authentication:Google:ClientSecret` | Google OAuth client secret; use user-secrets/env vars | ❌ |
| `Authentication:Google:CallbackUrl` | Public Google OAuth callback URL; defaults to `AppUrl:Frontend/api/auth/google-oauth-callback` | ❌ |
| `AppUrl:Frontend` | Customer frontend base URL for OAuth/email links | ✅ |
| `Email:FromAddress` | Transactional email sender address | ❌ |
| `Email:FromName` | Transactional email sender name | ❌ |
| `Email:Smtp:Host` | SMTP host; blank disables actual delivery but keeps queue safe | ❌ |
| `Email:Smtp:Port` | SMTP port, usually 587 | ❌ |
| `Email:Smtp:Username` | SMTP username | ❌ |
| `Email:Smtp:Password` | SMTP password; use user-secrets/env vars | ❌ |
| `Email:Smtp:EnableSsl` | Enable SMTP TLS | ❌ |

### Google Sign-In

Create a Google OAuth web client and add the callback URL used by the customer frontend proxy:

```text
http://localhost:3000/api/auth/google-oauth-callback
```

Store secrets outside committed settings:

```bash
dotnet user-secrets set "Authentication:Google:ClientId" "<client-id>" --project apps/backend/Ecommerce/Ecommerce.WebAPI
dotnet user-secrets set "Authentication:Google:ClientSecret" "<client-secret>" --project apps/backend/Ecommerce/Ecommerce.WebAPI
```

### Email Notifications

Order confirmation, order status update, password reset, and admin resend emails are queued through the API and sent by `EmailBackgroundService`. SMTP delivery is disabled when `Email:Smtp:Host` is empty.

### Frontend (.env.local)

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:5000/api |

### Docker (.env)

Tham khảo file `docker-compose/.env.example` để xem danh sách đầy đủ các biến môi trường cho Docker deployment.

---

## 7. Chức năng chính của hệ thống

### Chức năng phía khách hàng (ecommerce-client)

| Module | Chức năng |
|--------|-----------|
| **Catalog** | Duyệt sản phẩm, lọc theo danh mục/thương hiệu, tìm kiếm, xem chi tiết |
| **Cart** | Thêm/sửa/xóa sản phẩm, Guest Cart (không cần đăng nhập), áp dụng mã giảm giá |
| **Checkout** | Nhập địa chỉ, chọn phương thức thanh toán (COD, VNPay), đặt hàng |
| **Orders** | Xem lịch sử đơn hàng, theo dõi trạng thái, hủy đơn |
| **Account** | Quản lý thông tin cá nhân, sổ địa chỉ, đổi mật khẩu |
| **Wishlist** | Lưu sản phẩm yêu thích |
| **Reviews** | Đánh giá sản phẩm, xem reviews của người khác |
| **Compare** | So sánh sản phẩm |
| **Notifications** | Nhận thông báo real-time qua SignalR |

### Chức năng phía quản trị (ecommerce-dashboard)

| Module | Chức năng |
|--------|-----------|
| **Dashboard** | Tổng quan doanh thu, đơn hàng, thống kê |
| **Products** | CRUD sản phẩm, quản lý variants, ảnh, thông số |
| **Categories** | Quản lý danh mục sản phẩm (cây phân cấp) |
| **Brands** | Quản lý thương hiệu |
| **Orders** | Xem/cập nhật trạng thái đơn hàng, export Excel |
| **Users** | Quản lý khách hàng, khóa tài khoản |
| **Roles & Permissions** | Phân quyền RBAC |
| **Reports** | Báo cáo doanh thu, sản phẩm bán chạy, đơn hàng |
| **Notifications** | Gửi thông báo đến khách hàng |
| **Logs** | Xem audit logs, performance logs |
| **Settings** | Cấu hình hệ thống (About, Contact, Banners) |

### Luồng nghiệp vụ chính

#### Checkout Flow
```
Thêm sản phẩm → Xem giỏ hàng → Checkout → Nhập địa chỉ → Chọn thanh toán → Đặt hàng → Order (Pending)
```

#### Order Lifecycle
```
Pending (0) → Processing (1) → Shipped (2) → Delivered (3)
                    ↓                            ↓
               Cancelled (4)              Returned (5)
```

#### Business Rules
- **Miễn phí vận chuyển**: Đơn hàng > 500,000 VND
- **Phí vận chuyển cố định**: 30,000 VND cho đơn ≤ 500,000 VND
- **Guest Cart**: Hỗ trợ giỏ hàng không cần đăng nhập, merge khi login

---

## 8. Xác thực & bảo mật

### Cơ chế xác thực
Hệ thống sử dụng **Dual Authentication Strategy**:

1. **JWT Access Token** (expire: 15 phút)
   - Lưu trong httpOnly Cookie
   - Gửi kèm Header `Authorization: Bearer <token>` (fallback)

2. **Refresh Token** (expire: 7 ngày)
   - Lưu trong httpOnly Cookie
   - Dùng để làm mới Access Token

3. **CSRF Protection**
   - Token CSRF được trả về trong response header
   - Client gửi kèm trong header `X-CSRF-Token`

### Luồng Authentication
```
1. Login → Server set cookies (access_token, refresh_token, csrf_token)
2. Request → Browser tự gửi cookies + Client gửi X-CSRF-Token header
3. Token hết hạn → Client gọi /auth/refresh → Server cấp token mới
4. Logout → Server xóa cookies
```

### Authorization
- **RBAC (Role-Based Access Control)**: Admin, Manager, Customer
- **Permission-Based**: Granular permissions per feature
- Middleware kiểm tra quyền trước khi xử lý request

### Điểm lưu ý bảo mật
- Cookies với `httpOnly`, `Secure`, `SameSite=Lax`
- Password hashing với ASP.NET Identity
- Rate limiting cho API nhạy cảm
- Input validation với FluentValidation
- CORS configured cho specific origins

---

## 9. Database & Migration

### Khởi tạo Database
Database được tự động khởi tạo và migrate khi backend khởi động lần đầu:

```csharp
// Program.cs
using (var scope = app.Services.CreateScope())
{
    await ApplicationDbContextSeed.SeedAsync(services);
}
```

### Migration
Entity Framework Core Migrations nằm trong:
```
Ecommerce.Infrastructure/Migrations/
├── 20260108141747_InitialCreate.cs
├── 20260111141433_AddGuestCartSupport.cs
└── ApplicationDbContextModelSnapshot.cs
```

#### Thêm migration mới:
```bash
cd apps/backend/Ecommerce
dotnet ef migrations add <MigrationName> --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
```

#### Apply migration:
```bash
dotnet ef database update --project Ecommerce.Infrastructure --startup-project Ecommerce.WebAPI
```

### Seed Data
Seed data tự động tạo:
- Admin user mặc định
- Roles (Admin, Customer)
- Sample categories, brands
- Permissions

---

## 10. Quy ước & tiêu chuẩn code

### Naming Convention

#### Backend (.NET)
| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Class, Interface | PascalCase | `ProductService`, `IProductRepository` |
| Method | PascalCase | `GetProductByIdAsync()` |
| Property | PascalCase | `ProductName`, `CreatedAt` |
| Private field | _camelCase | `_productRepository` |
| Parameter | camelCase | `productId`, `request` |
| Constant | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |

#### Frontend (TypeScript/React)
| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Component | PascalCase | `ProductCard.tsx` |
| Hook | camelCase, prefix `use` | `useAuth`, `useCart` |
| Function | camelCase | `handleSubmit`, `fetchProducts` |
| Type/Interface | PascalCase | `Product`, `OrderResponse` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |

### Quy ước API

#### Endpoint Pattern
```
GET    /api/products          # List (with pagination)
GET    /api/products/{id}     # Get by ID
POST   /api/products          # Create
PUT    /api/products/{id}     # Update
DELETE /api/products/{id}     # Delete
```

#### Response Format
```json
{
  "data": { ... },
  "message": "Success",
  "isSuccess": true,
  "errors": []
}
```

#### Pagination
```json
{
  "items": [...],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 100,
  "totalPages": 10
}
```

### Project Structure Convention
- **Features-based organization**: Mỗi feature có thư mục riêng chứa Commands, Queries, Handlers, DTOs
- **Vertical Slice**: Code liên quan đến feature đặt cùng nhau
- **Clean Architecture dependencies**: Domain ← Application ← Infrastructure ← WebAPI

---

## 11. Hướng phát triển & cải tiến

### Hạn chế hiện tại

1. **Testing**: Chưa có unit tests và integration tests
2. **Caching Strategy**: Redis chưa được tối ưu cho tất cả queries
3. **Search**: Tìm kiếm đơn giản bằng SQL LIKE, chưa có full-text search
4. **File Storage**: Lưu trữ local, chưa tích hợp cloud storage (S3, Azure Blob)
5. **Email Service**: Chưa có service gửi email thông báo đơn hàng
6. **Monitoring**: Chưa có APM (Application Performance Monitoring)

### Gợi ý cải tiến

| Ưu tiên | Cải tiến | Mô tả |
|---------|----------|-------|
| Cao | Unit Tests | Thêm xUnit tests cho Application layer |
| Cao | Email Notifications | Tích hợp SendGrid/Mailgun cho order confirmations |
| Trung bình | Elasticsearch | Full-text search cho products |
| Trung bình | Cloud Storage | Azure Blob/AWS S3 cho file uploads |
| Trung bình | CI/CD Pipeline | GitHub Actions cho automated deployment |
| Thấp | Multi-language | Hỗ trợ đa ngôn ngữ (i18n) |
| Thấp | PWA | Offline support cho mobile users |

---

## Tài liệu tham khảo

- [Docker Deployment Guide](./docs/DOCKER_GUIDE.md)
- [Business Requirements](./docs/business_requirements.md)
- [Authentication Proposal](./docs/authentication_proposal.md)
## Elasticsearch Product Search

The catalog now has a dedicated Elasticsearch search path at `GET /api/search/products`. Existing product endpoints remain unchanged, while the customer frontend switches to the new endpoint when the `/products` URL contains `q`.

For local development, start Elasticsearch with:

```bash
cd docker-compose
docker compose up -d elasticsearch
```

The development image installs the ICU analyzer plugin for Vietnamese-compatible tokenization. API configuration lives under `Elasticsearch` in `appsettings*.json`; see [docs/elasticsearch-setup.md](docs/elasticsearch-setup.md) for mapping, sync, and endpoint details.
