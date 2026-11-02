Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service backend

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`backend` là service .NET 8 Web API của hệ thống e-commerce. Đây là lớp API trung tâm để frontend và các thành phần khác giao tiếp với nghiệp vụ của hệ thống.

Backend chịu trách nhiệm:

- Cung cấp REST API cho hệ thống e-commerce.
- Xử lý authentication và authorization bằng JWT/cookie auth theo cấu hình backend.
- Xử lý nghiệp vụ sản phẩm, giỏ hàng, đơn hàng, thanh toán và các module backend khác.
- Kết nối database PostgreSQL, Redis cache và Elasticsearch search.
- Cung cấp healthcheck tại `/api/health` để Docker kiểm tra trạng thái container.
- Gửi tracing/observability qua OpenTelemetry OTLP đến Jaeger theo cấu hình `Observability__OtlpEndpoint`.

Tài liệu này chỉ mô tả service `backend` theo `docker-compose/docker-compose.yml` và các file backend liên quan. Không liệt kê endpoint nghiệp vụ ngoài `/api/health` vì Compose chỉ dùng endpoint này cho healthcheck.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `backend` trong `docker-compose/docker-compose.yml`:

- `build context`:

  ```yaml
  context: ../apps/backend/Ecommerce
  ```

  Docker build backend từ thư mục solution `.NET` của dự án.

- `dockerfile`:

  ```yaml
  dockerfile: Dockerfile
  ```

  Dockerfile nằm tại `apps/backend/Ecommerce/Dockerfile`. Dockerfile dùng multi-stage build:

  - Stage build: `mcr.microsoft.com/dotnet/sdk:8.0`
  - Stage runtime: `mcr.microsoft.com/dotnet/aspnet:8.0`
  - Publish project `Ecommerce.WebAPI/Ecommerce.WebAPI.csproj`
  - Expose port `5000`
  - Chạy `dotnet Ecommerce.WebAPI.dll`

- `container_name`: `ecommerce-backend`

  Tên container cố định khi Docker Compose tạo container backend.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `ports`:

  ```yaml
  - "${BACKEND_PORT:-5000}:5000"
  ```

  Port host mặc định là `5000`, map vào port `5000` trong container. Nếu đặt `BACKEND_PORT` trong `.env`, URL health/API từ máy host phải dùng port đã override.

- `environment`:

  Service backend khai báo nhiều biến môi trường cho ASP.NET, database, Redis/cache, JWT/auth, file storage, Elasticsearch, CORS/cookie và observability. Các biến quan trọng được giải thích ở mục 3.

- `volumes`:

  ```yaml
  - ../apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads:/app/wwwroot/uploads
  ```

  Thư mục upload local của source code được mount vào `/app/wwwroot/uploads` trong container.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Backend nằm trong network nội bộ `ecommerce-network` và gọi service khác bằng tên service Compose như `postgres`, `redis`, `elasticsearch`, `jaeger`.

- `extra_hosts`:

  ```yaml
  - "host.docker.internal:host-gateway"
  ```

  Cho phép container backend resolve `host.docker.internal` về host machine. Cấu hình này hữu ích khi backend trong container cần gọi dịch vụ chạy trực tiếp trên máy host. Trong Compose hiện tại, connection string mặc định của backend dùng PostgreSQL container qua `postgres`, không dùng `host.docker.internal`.

- `depends_on`:

  ```yaml
  postgres:
    condition: service_healthy
  redis:
    condition: service_healthy
  elasticsearch:
    condition: service_healthy
  jaeger:
    condition: service_started
  ```

  Backend chờ `postgres`, `redis`, `elasticsearch` healthy và chờ `jaeger` started trước khi khởi động.

- `healthcheck`:

  ```yaml
  test: [ "CMD", "curl", "-f", "http://localhost:5000/api/health" ]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
  ```

  Docker kiểm tra backend bằng cách gọi `/api/health` bên trong container, qua port container `5000`.

## 3. Các biến môi trường quan trọng

### ASP.NET

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Môi trường chạy của ASP.NET Core. | `${ASPNETCORE_ENVIRONMENT:-Production}` | Mặc định khi chạy Compose là `Production`. Nếu muốn bật behavior Development thì đặt `ASPNETCORE_ENVIRONMENT=Development` trong `.env`, nhưng cần kiểm tra tác động tới Swagger, HTTPS metadata và cấu hình secrets. Không phải secret. |

### Database

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `ConnectionStrings__DefaultConnection` | Connection string thực tế mà backend đọc qua cấu hình `ConnectionStrings:DefaultConnection`. | `${DB_CONNECTION_STRING:-Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;}` | Khi backend chạy trong Compose, host nên là `postgres`, không phải `localhost`. Có chứa password database nên không commit giá trị thật. |
| `DB_CONNECTION_STRING` | Biến `.env` dùng để override `ConnectionStrings__DefaultConnection`. | Nếu không set, Compose dùng `Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;` | Trong `docker-compose/.env.example`, giá trị mẫu đang dùng `Server=host.docker.internal;...`; nếu dùng PostgreSQL container của Compose thì cần đặt đúng dạng Npgsql/Postgres và host `postgres`. Có chứa thông tin đăng nhập nên là secret. |

### Redis/Cache

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `ConnectionStrings__Redis` | Connection string Redis theo nhánh `ConnectionStrings:Redis`. | `${REDIS_CONNECTION_STRING:-redis:6379}` | Khi backend chạy trong Compose, dùng `redis:6379`. Không dùng `localhost:6379` từ container backend. Không phải secret trong cấu hình hiện tại vì Redis không có password trong Compose. |
| `Redis__ConnectionString` | Connection string Redis theo nhánh `Redis:ConnectionString`. | `${REDIS_CONNECTION_STRING:-redis:6379}` | Cần đồng bộ với `ConnectionStrings__Redis` để tránh backend đọc sai nhánh cấu hình. |
| `Redis__InstanceName` | Prefix/instance name cho Redis key theo nhánh `Redis`. | `${REDIS_INSTANCE_NAME:-ecommerce:}` | Hữu ích để phân biệt key giữa môi trường. Không phải secret. |
| `CacheSettings__UseRedis` | Bật Redis cho cache backend. | `true` | Compose đang set cố định là `true`; biến `USE_REDIS` trong `.env.example` không được service backend dùng trực tiếp trong Compose hiện tại. |
| `CacheSettings__RedisConnection` | Connection string Redis theo nhánh `CacheSettings`. | `${REDIS_CONNECTION_STRING:-redis:6379}` | Khi chạy local bằng Compose, giữ host `redis`. |
| `CacheSettings__InstanceName` | Prefix/instance name cho cache key. | `${REDIS_INSTANCE_NAME:-ecommerce:}` | Đổi prefix nếu cần tách key giữa các môi trường local. |
| `CacheSettings__DefaultExpirationMinutes` | Thời gian hết hạn cache mặc định, tính theo phút. | `${CACHE_DEFAULT_EXPIRATION_MINUTES:-60}` | Có thể giảm khi debug dữ liệu cache. Không phải secret. |
| `CacheSettings__ProductExpirationMinutes` | Thời gian hết hạn cache sản phẩm, tính theo phút. | `${CACHE_PRODUCT_EXPIRATION_MINUTES:-10}` | Nếu sản phẩm hiển thị dữ liệu cũ, kiểm tra giá trị này và logic invalidation cache. |
| `CacheSettings__CategoryExpirationMinutes` | Thời gian hết hạn cache danh mục, tính theo phút. | `${CACHE_CATEGORY_EXPIRATION_MINUTES:-30}` | Không phải secret. |
| `CacheSettings__BrandExpirationMinutes` | Thời gian hết hạn cache thương hiệu, tính theo phút. | `${CACHE_BRAND_EXPIRATION_MINUTES:-30}` | Không phải secret. |
| `CacheSettings__GuestCartExpirationDays` | Thời gian lưu guest cart, tính theo ngày. | `${CACHE_GUEST_CART_EXPIRATION_DAYS:-7}` | Nếu giảm giá trị này, guest cart local sẽ hết hạn nhanh hơn. |
| `CacheSettings__UserCacheDuration` | Thời gian cache user theo cấu hình backend. | `${CACHE_USER_DURATION:-10}` | Đơn vị cần kiểm tra thêm trong code sử dụng cấu hình này. Không phải secret. |
| `CacheSettings__RoleCacheDuration` | Thời gian cache role theo cấu hình backend. | `${CACHE_ROLE_DURATION:-30}` | Đơn vị cần kiểm tra thêm trong code sử dụng cấu hình này. Không phải secret. |
| `CacheSettings__PermissionCacheDuration` | Thời gian cache permission theo cấu hình backend. | `${CACHE_PERMISSION_DURATION:-60}` | Đơn vị cần kiểm tra thêm trong code sử dụng cấu hình này. Không phải secret. |
| `CacheSettings__ConfigCacheDuration` | Thời gian cache config theo cấu hình backend. | `${CACHE_CONFIG_DURATION:-120}` | Đơn vị cần kiểm tra thêm trong code sử dụng cấu hình này. Không phải secret. |
| `CacheSettings__EntityCacheDuration` | Thời gian cache entity chung theo cấu hình backend. | `${CACHE_ENTITY_DURATION:-15}` | Đơn vị cần kiểm tra thêm trong code sử dụng cấu hình này. Không phải secret. |

### JWT/Auth

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `Jwt__SecretKey` | Secret key dùng ký và validate JWT. Backend sẽ lỗi nếu thiếu `Jwt:SecretKey`. | `${JWT_SECRET_KEY}` không có default trong Compose | Đây là secret bắt buộc. `.env.example` dùng `CHANGE_ME_MINIMUM_32_CHARACTERS`; khi chạy thật phải thay bằng giá trị mạnh, không commit lên git. |
| `Jwt__Issuer` | Issuer hợp lệ của JWT. | `${JWT_ISSUER:-Ecommerce}` | Cần đồng bộ với token do backend phát hành. Không phải secret. |
| `Jwt__Audience` | Audience hợp lệ của JWT. | `${JWT_AUDIENCE:-EcommerceUsers}` | Cần đồng bộ với token do backend phát hành. Không phải secret. |
| `Jwt__AccessTokenExpirationMinutes` | Thời hạn access token, tính theo phút. | `${JWT_EXPIRATION:-60}` | Local có thể để mặc định. Không phải secret. |
| `Auth__TokenHashSecret` | Secret dùng để hash token thô trong `TokenService`. Backend sẽ lỗi khi cần hash token nếu thiếu `Auth:TokenHashSecret`. | `${AUTH_TOKEN_HASH_SECRET}` không có default trong Compose | Đây là secret bắt buộc cho auth flow. `.env.example` dùng `CHANGE_ME_SEPARATE_TOKEN_HASH_SECRET_MIN_32_CHARS`; khi chạy thật phải thay bằng secret riêng, không dùng chung với `JWT_SECRET_KEY`. |

### FileStorage

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `FileStorage__AppUrl` | Base URL dùng khi backend tạo URL file theo cấu hình `FileStorage:AppUrl`. | `${FILE_STORAGE_APP_URL}` không có default trong Compose | `.env.example` để rỗng. Nếu cần trả absolute URL cho file, đặt URL backend phù hợp, ví dụ `http://localhost:5000`. Không phải secret. |
| `FileStorage__UploadFolder` | Tên thư mục upload theo cấu hình `FileStorage:UploadFolder`. | `${FILE_STORAGE_UPLOAD_FOLDER:-uploads}` | Compose cũng mount host folder `wwwroot/uploads` vào `/app/wwwroot/uploads`. Nếu đổi folder, cần kiểm tra lại mapping volume và code lưu file. Không phải secret. |

Lưu ý từ file backend: `Program.cs` có `app.UseStaticFiles()`. `AddServicesExtensions.cs` hiện đăng ký `IFileStorageService` bằng `SupabaseStorageService`; vì vậy nếu upload không ghi vào thư mục local đã mount, cần kiểm tra thêm cấu hình storage thực tế của backend.

### Elasticsearch

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `Elasticsearch__UseElasticsearch` | Bật sử dụng Elasticsearch trong backend. | `true` | Compose bật cố định. Nếu Elasticsearch chưa chạy, backend có thể vẫn khởi động tùy logic code, nhưng search Elasticsearch có thể không khả dụng; cần xem log backend. |
| `Elasticsearch__Uri` | URI backend dùng để gọi Elasticsearch. | `http://elasticsearch:9200` | Khi backend chạy trong Compose, giữ URI này. Không dùng `http://localhost:9200` từ container backend. |
| `Elasticsearch__DefaultIndex` | Tên index mặc định. | `${ELASTICSEARCH_DEFAULT_INDEX:-products}` | Local thường dùng `products`. Nếu đổi, dữ liệu search có thể cần reindex. |
| `Elasticsearch__Username` | Username Elasticsearch nếu có bật security. | `${ELASTICSEARCH_USERNAME:-}` rỗng | Service Elasticsearch trong Compose đang set `xpack.security.enabled=false`, nên mặc định không dùng username. Nếu deploy thật bật security, đây là thông tin nhạy cảm. |
| `Elasticsearch__Password` | Password Elasticsearch nếu có bật security. | `${ELASTICSEARCH_PASSWORD:-}` rỗng | Service Elasticsearch trong Compose đang tắt security. Nếu deploy thật bật security, đây là secret và không được commit. |
| `Elasticsearch__RunStartupReindex` | Cho phép backend chạy reindex lúc khởi động. | `true` | File backend có `ElasticsearchInitialSyncService`; nếu search thiếu dữ liệu, kiểm tra log backend để biết reindex có chạy không. |
| `Elasticsearch__RunDailyReindex` | Cho phép backend chạy reindex định kỳ hằng ngày. | `true` | Thời điểm chạy cụ thể cần kiểm tra thêm trong code/config backend nếu cần vận hành chính xác. |

### CORS/Cookie

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `Cors__AllowedOrigins__0` | Origin frontend thứ nhất được backend cho phép gọi API kèm credential/cookie. | `${FRONTEND_URL_1:-http://localhost:3000}` | Mặc định khớp `frontend-client`. Nếu đổi port client, cần đổi origin này. Không phải secret. |
| `Cors__AllowedOrigins__1` | Origin frontend thứ hai được backend cho phép gọi API kèm credential/cookie. | `${FRONTEND_URL_2:-http://localhost:3001}` | Mặc định khớp `frontend-dashboard`. Nếu đổi port dashboard, cần đổi origin này. Không phải secret. |
| `CookieSettings__ForceSecure` | Ép cookie auth dùng flag `Secure`. | `true` | Với HTTP local, cookie `Secure` có thể không được browser lưu/gửi. File `CookieAuthExtensions.cs` cho thấy localhost chỉ bật secure nếu `ForceSecure=true`; Compose đang set `true`, nên nếu login cookie lỗi khi chạy HTTP local, kiểm tra biến này. Không phải secret. |
| `AuthConfig__IncludeTokensInResponse` | Có trả token trong response body hay không. | `false` | Mặc định an toàn hơn vì token chủ yếu đi qua cookie. Chỉ bật khi cần tương thích client cũ và hiểu rõ rủi ro lộ token. |

### Observability

| Biến | Ý nghĩa | Giá trị mặc định trong Compose | Lưu ý local và bảo mật |
|---|---|---|---|
| `Observability__ServiceName` | Tên service xuất hiện trong trace/metrics. | `ecommerce-api` | Dùng để nhận diện backend trong Jaeger/observability. Không phải secret. |
| `Observability__ServiceVersion` | Version service xuất hiện trong trace. | `${APP_VERSION:-1.0.0}` | Có thể đổi theo phiên bản build/deploy. Không phải secret. |
| `Observability__OtlpEndpoint` | OTLP endpoint mà backend gửi trace đến. | `http://jaeger:4317` | Khi chạy trong Compose, dùng host `jaeger`. Không dùng `localhost:4317` từ container backend. |

## 4. Cách khởi động backend

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d backend
```

Do `backend` có `depends_on`, Docker Compose sẽ xử lý các dependency được khai báo cho backend. Backend chỉ bắt đầu sau khi `postgres`, `redis`, `elasticsearch` đạt `healthy` và `jaeger` đạt `started`.

## 5. Cách rebuild backend

Chạy từ thư mục `docker-compose`:

```bash
docker compose up -d --build backend
```

Lệnh này build lại image backend từ `../apps/backend/Ecommerce/Dockerfile`, sau đó khởi động lại service `backend`.

Nếu chỉ muốn xem lỗi build rõ hơn:

```bash
docker compose build backend
```

## 6. Cách xem log backend

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f backend
```

Log backend là nơi cần kiểm tra khi gặp lỗi build runtime, lỗi migration, lỗi kết nối PostgreSQL/Redis/Elasticsearch, lỗi JWT secret hoặc lỗi healthcheck.

## 7. Cách kiểm tra backend health

Mặc định backend map port host `5000` vào port container `5000`:

```yaml
ports:
  - "${BACKEND_PORT:-5000}:5000"
```

Nếu không override `BACKEND_PORT`, kiểm tra health từ máy host bằng:

```bash
curl http://localhost:5000/api/health
```

Nếu đã đặt `BACKEND_PORT` trong `.env`, dùng port đó:

```bash
curl http://localhost:<BACKEND_PORT>/api/health
```

Theo `Program.cs`, endpoint `/api/health` trả về JSON có trạng thái `healthy`, timestamp và version. Docker healthcheck cũng gọi endpoint này bên trong container:

```bash
curl -f http://localhost:5000/api/health
```

## 8. Backend phụ thuộc service nào

Theo `depends_on` trong `docker-compose.yml`, backend phụ thuộc:

- `postgres` với điều kiện `service_healthy`
- `redis` với điều kiện `service_healthy`
- `elasticsearch` với điều kiện `service_healthy`
- `jaeger` với điều kiện `service_started`

Ý nghĩa:

- `service_healthy`: Docker Compose chờ healthcheck của service đó pass trước khi khởi động backend. Với `postgres`, `redis`, `elasticsearch`, điều này giúp backend chỉ chạy sau khi các service hạ tầng đã sẵn sàng ở mức healthcheck.
- `service_started`: Docker Compose chỉ chờ container được start, không chờ healthcheck healthy. Với `jaeger`, Compose chỉ đảm bảo container Jaeger đã bắt đầu chạy.

Lưu ý: `depends_on` kiểm soát thứ tự khởi động, không đảm bảo nghiệp vụ backend đã sẵn sàng hoàn toàn. Backend vẫn có thể lỗi nếu connection string sai, secret thiếu, migration lỗi hoặc service dependency lỗi sau khi backend đã start.

## 9. Cách backend gọi các service khác trong Docker network

Khi backend chạy trong container, không dùng `localhost` để gọi container khác. `localhost` bên trong container backend là chính container backend.

Backend gọi các service khác bằng host nội bộ trong network `ecommerce-network`:

| Service | Host/URL nội bộ backend dùng | Căn cứ trong Compose |
|---|---|---|
| Postgres | `postgres` | `ConnectionStrings__DefaultConnection=${DB_CONNECTION_STRING:-Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;}` |
| Redis | `redis:6379` | `ConnectionStrings__Redis=${REDIS_CONNECTION_STRING:-redis:6379}` và `CacheSettings__RedisConnection=${REDIS_CONNECTION_STRING:-redis:6379}` |
| Elasticsearch | `http://elasticsearch:9200` | `Elasticsearch__Uri=http://elasticsearch:9200` |
| Jaeger OTLP | `http://jaeger:4317` | `Observability__OtlpEndpoint=http://jaeger:4317` |

Nếu gọi từ máy host, URL/port có thể khác vì phải đi qua port mapping. Nếu gọi từ container backend sang container khác, dùng tên service Compose như bảng trên.

## 10. Volume upload

Service backend có volume mapping:

```yaml
volumes:
  - ../apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads:/app/wwwroot/uploads
```

Ý nghĩa:

- Thư mục trên máy host: `apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads`
- Thư mục trong container: `/app/wwwroot/uploads`
- Mục tiêu: giữ dữ liệu upload local bên ngoài container, tránh mất file khi container backend bị xóa và tạo lại.

Backend Dockerfile có tạo thư mục `/app/uploads`, nhưng Compose đang mount vào `/app/wwwroot/uploads`. Vì vậy khi debug upload local, cần kiểm tra đường dẫn thực tế mà backend đang ghi file.

Từ file backend:

- `Program.cs` có `app.UseStaticFiles()`, nên file trong `wwwroot` có thể được phục vụ như static file nếu logic lưu file đặt đúng dưới `wwwroot`.
- `FileStorageConfig` có `UploadFolder` mặc định là `uploads`.
- `AddServicesExtensions.cs` hiện đăng ký `IFileStorageService` bằng `SupabaseStorageService`; nếu upload không xuất hiện trong `wwwroot/uploads`, cần kiểm tra thêm cấu hình storage thực tế và code upload đang dùng implementation nào.

## 11. Lỗi thường gặp

### 11.1. Backend build fail

- Dấu hiệu: `docker compose up -d --build backend` hoặc `docker compose build backend` thất bại ở bước restore/publish.
- Nguyên nhân: Dockerfile build từ `../apps/backend/Ecommerce`, restore `Ecommerce.WebAPI/Ecommerce.WebAPI.csproj` và publish project này. Lỗi thường nằm ở package restore, lỗi compile C#, thiếu file project, hoặc Docker build context không đúng.
- Cách xử lý: Chạy build riêng để xem log rõ:

  ```bash
  cd docker-compose
  docker compose build backend
  ```

  Nếu lỗi compile, sửa trong source backend rồi build lại:

  ```bash
  docker compose up -d --build backend
  ```

### 11.2. Backend không kết nối được Postgres

- Dấu hiệu: Log backend báo lỗi database, connection refused, timeout, authentication failed, hoặc lỗi migration khi khởi động.
- Nguyên nhân: `postgres` chưa healthy, connection string sai, dùng `localhost` trong container backend, hoặc user/password/database không khớp với volume PostgreSQL hiện có.
- Cách xử lý: Kiểm tra Postgres:

  ```bash
  docker compose ps postgres
  docker compose logs -f postgres
  ```

  Kiểm tra connection string. Khi backend chạy trong Compose, host phải là:

  ```text
  postgres
  ```

  Giá trị mặc định đúng theo Compose:

  ```text
  Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;
  ```

### 11.3. Backend không kết nối được Redis

- Dấu hiệu: Log backend báo lỗi Redis, timeout, connection refused hoặc Redis health không ổn.
- Nguyên nhân: `redis` chưa healthy, `REDIS_CONNECTION_STRING` sai, hoặc backend dùng `localhost:6379` trong container.
- Cách xử lý: Kiểm tra Redis:

  ```bash
  docker compose ps redis
  docker compose exec redis redis-cli ping
  ```

  Khi backend chạy trong Compose, Redis connection string nên là:

  ```text
  redis:6379
  ```

### 11.4. Backend không kết nối được Elasticsearch

- Dấu hiệu: Log backend báo lỗi Elasticsearch, search không khả dụng, reindex lỗi, connection refused hoặc timeout.
- Nguyên nhân: `elasticsearch` chưa healthy, backend dùng sai URI, hoặc Elasticsearch health status chưa phải `green/yellow`.
- Cách xử lý: Kiểm tra Elasticsearch:

  ```bash
  docker compose ps elasticsearch
  curl http://localhost:9200/_cluster/health
  docker compose logs -f elasticsearch
  ```

  Khi backend chạy trong Compose, URI đúng là:

  ```text
  http://elasticsearch:9200
  ```

### 11.5. Healthcheck fail

- Dấu hiệu: `docker compose ps backend` không hiển thị `healthy`, hoặc container backend bị đánh dấu unhealthy.
- Nguyên nhân: Healthcheck gọi `http://localhost:5000/api/health` bên trong container. Backend có thể chưa start xong, thiếu secret, migration lỗi, port nội bộ không lắng nghe, hoặc `/api/health` trả lỗi.
- Cách xử lý: Xem log backend:

  ```bash
  docker compose logs -f backend
  ```

  Kiểm tra health từ máy host với port host:

  ```bash
  curl http://localhost:5000/api/health
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.

### 11.6. Thiếu `JWT_SECRET_KEY`

- Dấu hiệu: Backend không khởi động hoặc log có lỗi `Missing Jwt:SecretKey in configuration.`
- Nguyên nhân: Compose khai báo `Jwt__SecretKey=${JWT_SECRET_KEY}` nhưng không có default. `AddAuthenticationExtensions.cs` throw lỗi nếu `Jwt:SecretKey` rỗng.
- Cách xử lý: Tạo/cập nhật `docker-compose/.env` và đặt secret đủ mạnh:

  ```env
  JWT_SECRET_KEY=thay_bang_chuoi_bi_mat_toi_thieu_32_ky_tu
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d backend
  ```

  Không commit secret thật vào git.

### 11.7. Thiếu `AUTH_TOKEN_HASH_SECRET`

- Dấu hiệu: Login/refresh token lỗi, hoặc log có lỗi `Auth:TokenHashSecret is not configured.`
- Nguyên nhân: Compose khai báo `Auth__TokenHashSecret=${AUTH_TOKEN_HASH_SECRET}` nhưng không có default. `TokenService` cần secret này để hash token.
- Cách xử lý: Đặt trong `docker-compose/.env`:

  ```env
  AUTH_TOKEN_HASH_SECRET=thay_bang_chuoi_bi_mat_rieng_toi_thieu_32_ky_tu
  ```

  Không dùng chung với `JWT_SECRET_KEY` khi deploy thật và không commit secret.

### 11.8. Lỗi CORS khi frontend gọi API

- Dấu hiệu: Browser chặn request API vì CORS, đặc biệt khi request có cookie/credentials.
- Nguyên nhân: Origin frontend không khớp với `Cors__AllowedOrigins__0` hoặc `Cors__AllowedOrigins__1`. Compose mặc định cho phép `http://localhost:3000` và `http://localhost:3001`.
- Cách xử lý: Nếu frontend chạy port khác, đặt biến tương ứng trong `.env`:

  ```env
  FRONTEND_URL_1=http://localhost:3000
  FRONTEND_URL_2=http://localhost:3001
  ```

  Sau đó restart backend:

  ```bash
  docker compose restart backend
  ```

### 11.9. Lỗi cookie secure khi chạy local

- Dấu hiệu: Login có vẻ thành công nhưng browser không lưu/gửi cookie auth, request sau đó vẫn bị xem là chưa đăng nhập.
- Nguyên nhân: Compose set `CookieSettings__ForceSecure=true`. Trong `CookieAuthExtensions.cs`, nếu request là localhost thì cookie chỉ bật secure khi `ForceSecure=true`; cookie `Secure` thường yêu cầu HTTPS.
- Cách xử lý: Compose hiện đang hard-code:

  ```yaml
  - CookieSettings__ForceSecure=true
  ```

  Vì vậy không thể override giá trị này chỉ bằng cách thêm `CookieSettings__ForceSecure=false` vào `.env`. Nếu cần debug cookie qua HTTP local, phải sửa `docker-compose.yml` để dùng biến môi trường, ví dụ `${COOKIE_FORCE_SECURE:-true}`, rồi đặt giá trị local phù hợp trong `.env`. Nếu không sửa Compose, giá trị trong container vẫn là `true`.

### 11.10. Upload file không lưu đúng thư mục

- Dấu hiệu: Upload thành công nhưng không thấy file trong `apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads`, hoặc URL file trả về không đúng.
- Nguyên nhân: Compose mount `wwwroot/uploads` vào `/app/wwwroot/uploads`, nhưng Dockerfile cũng tạo `/app/uploads`. Ngoài ra file backend hiện đăng ký `IFileStorageService` bằng `SupabaseStorageService`, nên upload thực tế có thể không ghi vào thư mục local này.
- Cách xử lý: Kiểm tra log backend và code storage đang dùng. Kiểm tra thư mục mount:

  ```bash
  docker compose exec backend ls -la /app/wwwroot/uploads
  ```

  Nếu backend đang dùng local file storage, đảm bảo `FileStorage__UploadFolder=uploads` và đường dẫn ghi file nằm dưới `/app/wwwroot/uploads`. Nếu backend đang dùng Supabase storage, cần kiểm tra thêm cấu hình Supabase.

### 11.11. Migration hoặc database schema chưa sẵn sàng

- Dấu hiệu: Backend start lỗi ở bước database, API trả lỗi thiếu bảng/relation, hoặc dữ liệu seed chưa có.
- Nguyên nhân: `Program.cs` gọi:

  ```csharp
  await context.Database.MigrateAsync();
  await ApplicationDbContextSeed.SeedAsync(services, true);
  ```

  Vì vậy backend tự chạy migration và seed khi khởi động. Nếu Postgres chưa sẵn sàng thật sự, connection string sai, quyền database thiếu, hoặc migration lỗi, backend có thể fail.

- Cách xử lý: Kiểm tra thứ tự:

  ```bash
  docker compose ps postgres
  docker compose logs -f postgres
  docker compose logs -f backend
  ```

  Nếu volume PostgreSQL cũ giữ schema hoặc credential không phù hợp, cần xử lý database hiện có hoặc reset volume local nếu chấp nhận mất dữ liệu:

  ```bash
  docker compose down -v
  docker compose up -d backend
  ```

  Lưu ý `docker compose down -v` có thể xóa dữ liệu volume của nhiều service, không chỉ PostgreSQL.
