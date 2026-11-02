Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service redis

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`redis` là service Redis Cache của hệ thống e-commerce khi chạy bằng Docker Compose.

Trong dự án này, Redis được backend cấu hình để dùng cho:

- Distributed cache: backend bật `CacheSettings__UseRedis=true`, nghĩa là cache được lưu ở Redis thay vì chỉ nằm trong bộ nhớ của một instance backend (fallback in-memory cache khi tắt Redis).
- Guest cart cache: backend có cấu hình `CacheSettings__GuestCartExpirationDays=${CACHE_GUEST_CART_EXPIRATION_DAYS:-7}` cho thời gian cache session giỏ hàng khách vãng lai (lưu ý dữ liệu gốc của giỏ hàng khách được lưu bền vững trong bảng `Carts` ở CSDL qua `AnonymousId` và cookie `guest_id`).
- Cache dữ liệu sản phẩm và danh mục: backend có các cấu hình `CacheSettings__ProductExpirationMinutes`, `CacheSettings__CategoryExpirationMinutes` và `CacheSettings__BrandExpirationMinutes`.
- Cache dữ liệu khác của backend: compose cũng khai báo thời gian cache cho user, role, permission, config và entity.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `redis` trong `docker-compose/docker-compose.yml`:

- `image`: `redis:7-alpine`

  Sử dụng Redis phiên bản 7 trên nền Alpine.

- `container_name`: `ecommerce-redis`

  Tên container cố định khi Docker Compose tạo container cho service này.

- `restart policy`: `unless-stopped`

  Container sẽ tự khởi động lại khi bị dừng do lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `ports`:

  ```yaml
  - "${REDIS_PORT:-6379}:6379"
  ```

  Port host mặc định là `6379`, map vào port `6379` trong container. Nếu đặt `REDIS_PORT` trong `.env`, port host sẽ đổi theo giá trị đó.

- `volumes`:

  ```yaml
  - redis_data:/data
  ```

  Compose mount named volume `redis_data` vào thư mục `/data` trong container Redis.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Service nằm trong network nội bộ `ecommerce-network`, cho phép backend gọi đến Redis bằng tên service `redis`.

- `healthcheck`:

  ```yaml
  test: [ "CMD", "redis-cli", "ping" ]
  interval: 10s
  timeout: 5s
  retries: 5
  ```

  Docker kiểm tra Redis bằng lệnh `redis-cli ping` mỗi 10 giây. Mỗi lần kiểm tra có timeout 5 giây và thử tối đa 5 lần trước khi đánh dấu container là không healthy.

## 3. Biến môi trường liên quan

Service `redis` trực tiếp dùng biến `REDIS_PORT`. Các biến còn lại nằm trong cấu hình environment của service `backend` để backend kết nối và sử dụng Redis.

| Biến | Giá trị mặc định trong docker-compose.yml | Nơi dùng | Ý nghĩa |
|---|---|---|---|
| `REDIS_PORT` | `6379` | `redis.ports` | Port trên máy host được map vào port `6379` trong container Redis. |
| `REDIS_CONNECTION_STRING` | `redis:6379` | `backend.environment` | Chuỗi kết nối Redis mà backend dùng qua `ConnectionStrings__Redis`, `Redis__ConnectionString` và `CacheSettings__RedisConnection`. |
| `REDIS_INSTANCE_NAME` | `ecommerce:` | `backend.environment` | Prefix hoặc instance name cho key Redis qua `Redis__InstanceName` và `CacheSettings__InstanceName`. |
| `CacheSettings__UseRedis` | `true` | `backend.environment` | Bật Redis cho cache backend. Giá trị này đang được set cố định trong Compose, không lấy từ biến `.env`. |
| `CACHE_DEFAULT_EXPIRATION_MINUTES` | `60` | `CacheSettings__DefaultExpirationMinutes` | Thời gian hết hạn cache mặc định, tính theo phút. |
| `CACHE_PRODUCT_EXPIRATION_MINUTES` | `10` | `CacheSettings__ProductExpirationMinutes` | Thời gian hết hạn cache sản phẩm, tính theo phút. |
| `CACHE_CATEGORY_EXPIRATION_MINUTES` | `30` | `CacheSettings__CategoryExpirationMinutes` | Thời gian hết hạn cache danh mục, tính theo phút. |
| `CACHE_BRAND_EXPIRATION_MINUTES` | `30` | `CacheSettings__BrandExpirationMinutes` | Thời gian hết hạn cache thương hiệu, tính theo phút. |
| `CACHE_GUEST_CART_EXPIRATION_DAYS` | `7` | `CacheSettings__GuestCartExpirationDays` | Thời gian lưu guest cart, tính theo ngày. |
| `CACHE_USER_DURATION` | `10` | `CacheSettings__UserCacheDuration` | Thời gian cache dữ liệu user, theo cấu hình backend. Đơn vị cần kiểm tra thêm trong code backend. |
| `CACHE_ROLE_DURATION` | `30` | `CacheSettings__RoleCacheDuration` | Thời gian cache dữ liệu role, theo cấu hình backend. Đơn vị cần kiểm tra thêm trong code backend. |
| `CACHE_PERMISSION_DURATION` | `60` | `CacheSettings__PermissionCacheDuration` | Thời gian cache dữ liệu permission, theo cấu hình backend. Đơn vị cần kiểm tra thêm trong code backend. |
| `CACHE_CONFIG_DURATION` | `120` | `CacheSettings__ConfigCacheDuration` | Thời gian cache dữ liệu cấu hình, theo cấu hình backend. Đơn vị cần kiểm tra thêm trong code backend. |
| `CACHE_ENTITY_DURATION` | `15` | `CacheSettings__EntityCacheDuration` | Thời gian cache entity chung, theo cấu hình backend. Đơn vị cần kiểm tra thêm trong code backend. |

Các dòng Redis/CacheSettings trong service `backend`:

```yaml
- ConnectionStrings__Redis=${REDIS_CONNECTION_STRING:-redis:6379}
- Redis__ConnectionString=${REDIS_CONNECTION_STRING:-redis:6379}
- Redis__InstanceName=${REDIS_INSTANCE_NAME:-ecommerce:}
- CacheSettings__UseRedis=true
- CacheSettings__RedisConnection=${REDIS_CONNECTION_STRING:-redis:6379}
- CacheSettings__InstanceName=${REDIS_INSTANCE_NAME:-ecommerce:}
- CacheSettings__DefaultExpirationMinutes=${CACHE_DEFAULT_EXPIRATION_MINUTES:-60}
- CacheSettings__ProductExpirationMinutes=${CACHE_PRODUCT_EXPIRATION_MINUTES:-10}
- CacheSettings__CategoryExpirationMinutes=${CACHE_CATEGORY_EXPIRATION_MINUTES:-30}
- CacheSettings__BrandExpirationMinutes=${CACHE_BRAND_EXPIRATION_MINUTES:-30}
- CacheSettings__GuestCartExpirationDays=${CACHE_GUEST_CART_EXPIRATION_DAYS:-7}
- CacheSettings__UserCacheDuration=${CACHE_USER_DURATION:-10}
- CacheSettings__RoleCacheDuration=${CACHE_ROLE_DURATION:-30}
- CacheSettings__PermissionCacheDuration=${CACHE_PERMISSION_DURATION:-60}
- CacheSettings__ConfigCacheDuration=${CACHE_CONFIG_DURATION:-120}
- CacheSettings__EntityCacheDuration=${CACHE_ENTITY_DURATION:-15}
```

## 4. Cách khởi động riêng Redis

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d redis
```

Lệnh này khởi động riêng service `redis` cùng network và volume cần thiết.

## 5. Cách kiểm tra Redis

Chạy từ thư mục `docker-compose`:

```bash
docker compose ps redis
docker compose logs -f redis
docker compose exec redis redis-cli ping
```

Nếu Redis hoạt động bình thường, lệnh:

```bash
docker compose exec redis redis-cli ping
```

sẽ trả về:

```text
PONG
```

`PONG` nghĩa là Redis server trong container đã nhận được lệnh `PING` và phản hồi thành công. Đây cũng là logic healthcheck đang được Compose dùng qua `redis-cli ping`.

## 6. Cách backend kết nối Redis

Khi `backend` chạy trong Docker Compose network, backend kết nối đến Redis bằng tên service và port container:

```text
redis:6379
```

Không dùng `localhost:6379` từ container backend. Trong container backend, `localhost` là chính container backend, không phải container Redis.

Trong `docker-compose.yml`, backend đang dùng mặc định:

```yaml
ConnectionStrings__Redis=${REDIS_CONNECTION_STRING:-redis:6379}
Redis__ConnectionString=${REDIS_CONNECTION_STRING:-redis:6379}
CacheSettings__RedisConnection=${REDIS_CONNECTION_STRING:-redis:6379}
```

Nếu đặt `REDIS_CONNECTION_STRING` trong `.env`, khi backend chạy trong Compose vẫn nên dùng host nội bộ `redis`, ví dụ:

```text
redis:6379
```

## 7. Dữ liệu Redis lưu ở đâu

Service `redis` mount named volume:

```text
redis_data
```

vào thư mục trong container:

```text
/data
```

Cấu hình trong Compose:

```yaml
volumes:
  - redis_data:/data
```

Compose hiện không khai báo thêm command Redis riêng trong service `redis`. Vì vậy tài liệu này chỉ khẳng định theo Compose rằng thư mục `/data` của container được gắn với volume `redis_data`.

Cảnh báo: lệnh dưới đây có thể xóa volume `redis_data` và làm mất dữ liệu Redis local nằm trong volume:

```bash
docker compose down -v
```

Với dữ liệu cache, backend có thể tạo lại nếu logic backend hỗ trợ; cần kiểm tra thêm trong code backend. Guest cart hoặc dữ liệu tạm đang lưu trong Redis có thể bị mất nếu volume bị xóa.

## 8. Lỗi thường gặp

### 8.1. Port 6379 bị chiếm

- Dấu hiệu: `docker compose up -d redis` thất bại, output báo không bind được port `6379` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Redis local hoặc container khác đang dùng port `6379`.
- Cách xử lý: Đổi `REDIS_PORT` trong `.env`, ví dụ dùng `6380`, rồi chạy lại:

  ```bash
  docker compose up -d redis
  docker compose ps redis
  ```

  Khi backend chạy trong Compose, backend vẫn dùng `redis:6379` vì đó là port nội bộ của container Redis. Port `REDIS_PORT` chỉ ảnh hưởng kết nối từ máy host vào container.

### 8.2. Backend báo không kết nối được Redis

- Dấu hiệu: Log backend báo lỗi kết nối Redis, timeout, connection refused hoặc không resolve được host Redis.
- Nguyên nhân: `redis` chưa chạy, `redis` chưa healthy, backend dùng sai connection string, hoặc connection string đang dùng `localhost:6379` trong container backend.
- Cách xử lý: Kiểm tra Redis trước:

  ```bash
  docker compose ps redis
  docker compose exec redis redis-cli ping
  ```

  Sau đó kiểm tra cấu hình backend. Khi chạy trong Compose, giá trị đúng theo compose mặc định là:

  ```text
  redis:6379
  ```

### 8.3. Redis chưa `healthy`

- Dấu hiệu: `docker compose ps redis` không hiển thị trạng thái `healthy`, hoặc backend chưa khởi động vì đang chờ dependency `redis`.
- Nguyên nhân: Redis chưa sẵn sàng trả lời `redis-cli ping`, container đang restart, hoặc Redis gặp lỗi khi khởi động.
- Cách xử lý: Xem trạng thái và log:

  ```bash
  docker compose ps redis
  docker compose logs -f redis
  ```

  Kiểm tra trực tiếp lệnh ping:

  ```bash
  docker compose exec redis redis-cli ping
  ```

  Nếu trả về `PONG`, Redis đã phản hồi được.

### 8.4. Cache dữ liệu cũ gây hiểu nhầm

- Dấu hiệu: Dữ liệu API từ backend vẫn là dữ liệu cũ dù database đã thay đổi, ví dụ sản phẩm, danh mục hoặc thương hiệu chưa cập nhật ngay.
- Nguyên nhân: Backend đang bật Redis cache qua `CacheSettings__UseRedis=true` và có các thời gian hết hạn cache như `CacheSettings__ProductExpirationMinutes`, `CacheSettings__CategoryExpirationMinutes`, `CacheSettings__BrandExpirationMinutes`.
- Cách xử lý: Kiểm tra các giá trị cache trong `.env` hoặc default trong Compose. Có thể restart Redis để xóa cache local hiện tại:

  ```bash
  docker compose restart redis
  ```

  Nếu dữ liệu vẫn không đổi, cần kiểm tra thêm logic invalidation cache trong backend.

### 8.5. Mất dữ liệu khi dùng `docker compose down -v`

- Dấu hiệu: Sau khi chạy lại stack, cache Redis hoặc guest cart local không còn như trước.
- Nguyên nhân: Lệnh `docker compose down -v` xóa named volume, trong đó có `redis_data`.
- Cách xử lý: Không dùng `docker compose down -v` nếu muốn giữ dữ liệu Redis local. Dùng lệnh sau để dừng stack nhưng giữ volume:

  ```bash
  docker compose down
  ```

  Chỉ dùng `docker compose down -v` khi muốn reset dữ liệu local.
