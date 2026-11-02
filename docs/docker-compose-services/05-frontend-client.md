Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service frontend-client

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`frontend-client` là website khách hàng của hệ thống e-commerce. Đây là giao diện dành cho người dùng cuối để xem sản phẩm, tìm kiếm sản phẩm, thao tác giỏ hàng, đăng nhập và thực hiện các luồng mua hàng.

Trong Docker Compose, service này chạy ứng dụng Next.js customer website từ thư mục `apps/frontend/ecommerce-client` và phụ thuộc vào service `backend` để gọi API.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `frontend-client` trong `docker-compose/docker-compose.yml`:

- `build context`:

  ```yaml
  context: ../apps/frontend/ecommerce-client
  ```

  Docker build frontend client từ thư mục source `apps/frontend/ecommerce-client`.

- `dockerfile`:

  ```yaml
  dockerfile: Dockerfile
  ```

  Dockerfile nằm tại `apps/frontend/ecommerce-client/Dockerfile`. Dockerfile build ứng dụng Next.js bằng `npm run build` và chạy bản standalone bằng `node server.js`.

- `build args`:

  ```yaml
  args:
    - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:5000/api}
  ```

  `NEXT_PUBLIC_API_URL` được truyền vào lúc build image. Với biến `NEXT_PUBLIC_*`, cần lưu ý rằng phần dùng trong browser bundle có thể được đóng gói theo giá trị lúc build.

- `container_name`: `ecommerce-client`

  Tên container cố định khi Docker Compose tạo container cho service này.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `ports`:

  ```yaml
  - "${CLIENT_PORT:-3000}:3000"
  ```

  Port host mặc định là `3000`, map vào port `3000` trong container Next.js.

- `environment`:

  ```yaml
  - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:5000/api}
  ```

  Runtime environment của container cũng có `NEXT_PUBLIC_API_URL` với cùng default trong Compose.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Service nằm trong network nội bộ `ecommerce-network`, có thể gọi backend bằng hostname service `backend` từ phía container/server.

- `depends_on`:

  ```yaml
  depends_on:
    - backend
  ```

  Compose khởi động `backend` trước `frontend-client`. Điều kiện này chỉ kiểm soát thứ tự start, không chờ backend `healthy`.

## 3. Biến môi trường quan trọng

| Biến | Giá trị mặc định trong Compose | Ý nghĩa | Lưu ý khi chạy local |
|---|---|---|---|
| `CLIENT_PORT` | `3000` | Port trên máy host được map vào port `3000` trong container. | Nếu port `3000` bị chiếm, đặt `CLIENT_PORT` trong `.env`, ví dụ `CLIENT_PORT=3002`. Khi đó URL truy cập frontend cũng đổi theo port mới. |
| `NEXT_PUBLIC_API_URL` | `http://backend:5000/api` | URL API backend dùng cho build/runtime frontend. Compose truyền biến này vào cả `build.args` và `environment`. | `http://backend:5000/api` chỉ resolve được bên trong Docker network. Browser trên máy host không tự resolve hostname `backend` nếu gọi trực tiếp URL này. |

Sự khác nhau giữa URL API bên trong Docker network và URL API browser gọi được:

- URL bên trong Docker network: `http://backend:5000/api`

  URL này dùng được khi request được thực hiện từ container `frontend-client` hoặc từ server-side của Next.js đang chạy trong container. Hostname `backend` là tên service trong Compose network.

- URL browser người dùng gọi được từ máy host: thường là qua frontend origin `http://localhost:3000` và rewrite/proxy của Next.js, hoặc backend host-mapped URL `http://localhost:5000/api` nếu gọi backend trực tiếp từ browser.

Với cấu hình hiện tại:

- `docker-compose.yml` default `NEXT_PUBLIC_API_URL` là `http://backend:5000/api`.
- `apps/frontend/ecommerce-client/lib/api.ts` cấu hình axios với `baseURL: '/api'`, nghĩa là request chính từ browser đi cùng origin frontend trước.
- `apps/frontend/ecommerce-client/next.config.ts` rewrite `/api/:path*` sang backend base lấy từ `NEXT_PUBLIC_API_URL`.
- `apps/frontend/ecommerce-client/hubs/signalr-context.tsx` cũng dùng base URL `/api` cho SignalR.
- `apps/frontend/ecommerce-client/components/MarqueeBar.tsx` là server component và fetch trực tiếp `${NEXT_PUBLIC_API_URL}/marquee`; với default Compose, request này chạy được từ server/container vì `backend` resolve được trong Docker network.

Lưu ý quan trọng:

- Nếu frontend code chạy trên server/container, `http://backend:5000/api` là URL phù hợp.
- Nếu browser trực tiếp gọi `http://backend:5000/api`, browser ngoài Docker thường không resolve được hostname `backend`.
- Với code hiện tại, các request chính nên đi qua `/api` cùng origin và Next rewrite sang backend. Nếu thêm code mới dùng trực tiếp `process.env.NEXT_PUBLIC_API_URL` trong client component, cần kiểm tra kỹ vì giá trị `http://backend:5000/api` có thể bị đưa ra browser.
- `docker-compose/.env.example` đang đặt `NEXT_PUBLIC_API_URL=http://localhost:5000/api`. Nếu dùng giá trị này khi build container, server-side trong container sẽ gọi `localhost:5000`, tức là chính container frontend, không phải backend. Vì vậy khi chạy cả stack trong Docker Compose, cần kiểm tra giá trị `.env` để không ghi đè default `http://backend:5000/api` một cách sai ngữ cảnh.

## 4. Cách khởi động frontend-client

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d frontend-client
```

Lệnh này khởi động `frontend-client` và service `backend` theo `depends_on` nếu backend chưa chạy.

## 5. Cách rebuild frontend-client

Chạy từ thư mục `docker-compose`:

```bash
docker compose up -d --build frontend-client
```

Lệnh này build lại image từ `apps/frontend/ecommerce-client/Dockerfile`, truyền lại build arg `NEXT_PUBLIC_API_URL`, rồi khởi động container.

Nếu muốn xem lỗi build rõ hơn:

```bash
docker compose build frontend-client
```

## 6. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f frontend-client
```

Log này hữu ích khi kiểm tra lỗi start Next.js standalone server, lỗi runtime khi rewrite API, hoặc lỗi build nếu container vừa được build lại.

## 7. Cách truy cập

Theo Compose:

```yaml
ports:
  - "${CLIENT_PORT:-3000}:3000"
```

Nếu không override `CLIENT_PORT`, truy cập website khách hàng tại:

```text
http://localhost:3000
```

Nếu đã đặt `CLIENT_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<CLIENT_PORT>
```

Ví dụ nếu đặt `CLIENT_PORT=3002`, URL local là:

```text
http://localhost:3002
```

## 8. Quan hệ với backend

Service `frontend-client` phụ thuộc `backend`:

```yaml
depends_on:
  - backend
```

Ý nghĩa:

- Docker Compose start `backend` trước `frontend-client`.
- `depends_on` dạng danh sách này không chờ healthcheck backend `healthy`; nó chỉ đảm bảo thứ tự khởi động.
- Frontend gọi API backend thông qua cấu hình `NEXT_PUBLIC_API_URL` và rewrite `/api` trong Next.js.
- Trong Docker network, hostname backend là `backend` và port container là `5000`.

## 9. Lỗi thường gặp

### 9.1. Port 3000 bị chiếm

- Dấu hiệu: `docker compose up -d frontend-client` thất bại, output báo không bind được port `3000` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Next.js dev server hoặc container khác đang dùng port `3000`.
- Cách xử lý: Đổi `CLIENT_PORT` trong `docker-compose/.env`, ví dụ:

  ```env
  CLIENT_PORT=3002
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d frontend-client
  docker compose ps frontend-client
  ```

  Truy cập bằng port mới, ví dụ `http://localhost:3002`.

### 9.2. Build Next.js fail

- Dấu hiệu: `docker compose up -d --build frontend-client` hoặc `docker compose build frontend-client` thất bại ở bước `npm ci` hoặc `npm run build`.
- Nguyên nhân: Dockerfile chạy `npm ci --only=production=false` rồi `npm run build`. Lỗi có thể đến từ dependency, TypeScript, ESLint/build rule của Next.js, hoặc biến môi trường build không phù hợp.
- Cách xử lý: Build riêng để xem log đầy đủ:

  ```bash
  cd docker-compose
  docker compose build frontend-client
  ```

  Nếu lỗi liên quan API URL tại build/server component, kiểm tra `NEXT_PUBLIC_API_URL` đang được truyền vào build args:

  ```yaml
  args:
    - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:5000/api}
  ```

### 9.3. Frontend không gọi được API

- Dấu hiệu: Trang mở được nhưng dữ liệu không tải, request API lỗi trong browser console hoặc log frontend.
- Nguyên nhân: Backend chưa sẵn sàng, rewrite `/api` không tới được backend, hoặc `NEXT_PUBLIC_API_URL` không phù hợp với ngữ cảnh Docker/browser.
- Cách xử lý: Kiểm tra backend trước:

  ```bash
  docker compose ps backend
  docker compose logs -f backend
  ```

  Kiểm tra frontend log:

  ```bash
  docker compose logs -f frontend-client
  ```

  Với Compose mặc định, frontend nên proxy request `/api` sang:

  ```text
  http://backend:5000/api
  ```

### 9.4. `NEXT_PUBLIC_API_URL` sai

- Dấu hiệu: Server-side fetch hoặc Next rewrite gọi sai host, ví dụ gọi `localhost:5000` từ bên trong container frontend và không tới được backend.
- Nguyên nhân: `.env` ghi đè default Compose. `docker-compose/.env.example` có `NEXT_PUBLIC_API_URL=http://localhost:5000/api`; giá trị này đúng khi chạy frontend trực tiếp trên máy host, nhưng dễ sai khi frontend chạy trong container vì `localhost` là container frontend.
- Cách xử lý: Khi chạy frontend và backend cùng Docker Compose network, dùng:

  ```env
  NEXT_PUBLIC_API_URL=http://backend:5000/api
  ```

  Sau khi đổi biến này, rebuild frontend vì Compose truyền biến vào build args:

  ```bash
  docker compose up -d --build frontend-client
  ```

### 9.5. Backend chưa chạy hoặc chưa sẵn sàng

- Dấu hiệu: Frontend container chạy, nhưng request API trả lỗi 502/connection refused hoặc dữ liệu không tải.
- Nguyên nhân: `depends_on` chỉ start backend trước, không chờ backend `healthy`. Backend có thể đang migration, thiếu secret, lỗi database, hoặc healthcheck chưa pass.
- Cách xử lý: Kiểm tra backend health:

  ```bash
  docker compose ps backend
  curl http://localhost:5000/api/health
  docker compose logs -f backend
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.

### 9.6. Lỗi CORS/cookie/auth

- Dấu hiệu: Request API bị browser chặn CORS, login xong không giữ trạng thái, hoặc cookie auth không được gửi.
- Nguyên nhân: Backend Compose mặc định cho phép origin `http://localhost:3000` qua `Cors__AllowedOrigins__0`. Nếu đổi `CLIENT_PORT`, origin frontend cũng đổi và có thể không còn khớp. Backend cũng đang set `CookieSettings__ForceSecure=true`, có thể ảnh hưởng cookie khi chạy HTTP local.
- Cách xử lý: Nếu đổi `CLIENT_PORT`, cập nhật origin backend tương ứng trong `.env`, ví dụ:

  ```env
  CLIENT_PORT=3002
  FRONTEND_URL_1=http://localhost:3002
  ```

  Sau đó restart backend và frontend:

  ```bash
  docker compose restart backend frontend-client
  ```

  Nếu lỗi liên quan cookie secure khi chạy HTTP local, cần kiểm tra cấu hình backend `CookieSettings__ForceSecure` trong `docker-compose.yml`.

### 9.7. Browser không resolve được hostname `backend`

- Dấu hiệu: Browser console báo lỗi DNS hoặc network khi request tới `http://backend:5000/api`.
- Nguyên nhân: `backend` là hostname nội bộ của Docker Compose network. Browser chạy trên máy host không nằm trong Docker network nên thường không resolve được hostname này.
- Cách xử lý: Không gọi trực tiếp `http://backend:5000/api` từ browser. Với code hiện tại, request chính nên dùng same-origin:

  ```text
  /api
  ```

  rồi để Next.js rewrite sang backend trong container. Nếu cần browser gọi backend trực tiếp từ máy host, dùng host-mapped URL:

  ```text
  http://localhost:5000/api
  ```

  nhưng khi dùng cách này phải kiểm tra lại CORS, cookie và auth.

### 9.8. Nhầm lẫn khi dùng `docker compose down -v`

- Dấu hiệu: Sau khi reset stack, dữ liệu database, cache, index search hoặc dashboard local của các service khác bị mất dù chỉ đang debug `frontend-client`.
- Nguyên nhân: Service `frontend-client` không khai báo named volume riêng trong `docker-compose.yml`, nhưng lệnh dưới đây chạy ở cấp toàn Docker Compose project và có thể xóa các named volume của stack:

  ```bash
  docker compose down -v
  ```

  Các volume dữ liệu liên quan gồm `postgres_data`, `redis_data`, `elasticsearch_data`, `prometheus_data` và `grafana_data`.

- Cách xử lý: Nếu chỉ muốn dừng frontend hoặc reset container frontend, không dùng `down -v`. Chạy từ thư mục `docker-compose`:

  ```bash
  cd docker-compose
  docker compose restart frontend-client
  docker compose up -d --build frontend-client
  ```

  Chỉ dùng `docker compose down -v` khi muốn reset toàn bộ dữ liệu local của stack.
