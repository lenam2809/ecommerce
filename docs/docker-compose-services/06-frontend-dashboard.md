Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service frontend-dashboard

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`frontend-dashboard` là trang quản trị admin dashboard của hệ thống e-commerce. Service này chạy ứng dụng Next.js dành cho người quản trị để thao tác với các chức năng quản trị thông qua API của `backend`.

Trong Docker Compose, dashboard được build từ thư mục `apps/frontend/ecommerce-dashboard`, chạy trong container `ecommerce-dashboard`, expose ra máy host qua port mặc định `3001`, và phụ thuộc vào service `backend`.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `frontend-dashboard` trong `docker-compose/docker-compose.yml`:

- `build context`:

  ```yaml
  context: ../apps/frontend/ecommerce-dashboard
  ```

  Docker build dashboard từ thư mục source `apps/frontend/ecommerce-dashboard`.

- `dockerfile`:

  ```yaml
  dockerfile: Dockerfile
  ```

  Dockerfile nằm tại `apps/frontend/ecommerce-dashboard/Dockerfile`. Dockerfile build ứng dụng Next.js bằng `npm run build` và chạy bản standalone bằng `node server.js`.

- `build args`:

  ```yaml
  args:
    - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:5000/api}
  ```

  `NEXT_PUBLIC_API_URL` được truyền vào quá trình build image. Vì đây là biến `NEXT_PUBLIC_*`, cần chú ý giá trị có thể được dùng trong bundle frontend hoặc trong cấu hình Next.js tại thời điểm build.

- `container_name`: `ecommerce-dashboard`

  Tên container cố định khi Docker Compose tạo container dashboard.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `ports`:

  ```yaml
  - "${DASHBOARD_PORT:-3001}:3000"
  ```

  Port host mặc định là `3001`, map vào port `3000` trong container Next.js.

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

  Compose start `backend` trước `frontend-dashboard`. Dạng `depends_on` này không chờ backend `healthy`.

## 3. Biến môi trường quan trọng

| Biến | Giá trị mặc định trong Compose | Ý nghĩa | Lưu ý khi chạy local |
|---|---|---|---|
| `DASHBOARD_PORT` | `3001` | Port trên máy host được map vào port `3000` trong container dashboard. | Nếu port `3001` bị chiếm, đặt `DASHBOARD_PORT` trong `.env`, ví dụ `DASHBOARD_PORT=3003`. Khi đó URL truy cập dashboard đổi theo port mới. |
| `NEXT_PUBLIC_API_URL` | `http://backend:5000/api` | URL API backend dùng cho build/runtime dashboard. Compose truyền biến này vào cả `build.args` và `environment`. | `http://backend:5000/api` chỉ resolve được bên trong Docker network. Browser trên máy host không tự resolve hostname `backend` nếu gọi trực tiếp URL này. |

Lưu ý về URL API trong Docker network và URL API từ browser:

- URL trong Docker network: `http://backend:5000/api`

  URL này dùng được khi request được thực hiện từ container `frontend-dashboard` hoặc từ server-side của Next.js trong container. Hostname `backend` là tên service nội bộ của Docker Compose.

- URL browser gọi được từ máy host: thường đi qua dashboard origin `http://localhost:3001` và Next.js rewrite/proxy, hoặc gọi trực tiếp backend bằng host-mapped URL `http://localhost:5000/api` nếu cấu hình frontend/backend cho phép.

Với code dashboard hiện tại:

- `apps/frontend/ecommerce-dashboard/lib/axios.ts` tạo axios instance với `baseURL: '/api'` và `withCredentials: true`, nghĩa là request chính từ browser đi cùng origin dashboard trước.
- `apps/frontend/ecommerce-dashboard/next.config.ts` rewrite `/api/:path*` sang backend base lấy từ `NEXT_PUBLIC_API_URL`.
- `apps/frontend/ecommerce-dashboard/next.config.ts` cũng rewrite `/uploads/:path*` sang backend base tương ứng.
- `apps/frontend/ecommerce-dashboard/notifications/signalr-connection-manager.ts` dùng base URL `/api` cho SignalR, tức là cũng đi qua same-origin và rewrite.

Điểm cần chú ý:

- Nếu dashboard code chạy phía server/container, `http://backend:5000/api` là URL phù hợp khi chạy cùng Docker Compose.
- Nếu browser trực tiếp gọi `http://backend:5000/api`, browser ngoài Docker thường không resolve được hostname `backend`.
- Nếu thêm code mới trong client component và dùng trực tiếp `process.env.NEXT_PUBLIC_API_URL`, cần kiểm tra để không đưa URL nội bộ `http://backend:5000/api` ra browser.
- `docker-compose/.env.example` đang đặt `NEXT_PUBLIC_API_URL=http://localhost:5000/api`. Giá trị này có thể phù hợp khi dashboard chạy trực tiếp trên máy host, nhưng khi dashboard chạy trong container, `localhost:5000` là chính container dashboard, không phải backend. Khi chạy cả stack bằng Docker Compose, cần kiểm tra `.env` để không ghi đè default `http://backend:5000/api` sai ngữ cảnh.

## 4. Cách khởi động frontend-dashboard

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d frontend-dashboard
```

Lệnh này khởi động `frontend-dashboard` và service `backend` theo `depends_on` nếu backend chưa chạy.

## 5. Cách rebuild frontend-dashboard

Chạy từ thư mục `docker-compose`:

```bash
docker compose up -d --build frontend-dashboard
```

Lệnh này build lại image từ `apps/frontend/ecommerce-dashboard/Dockerfile`, truyền lại build arg `NEXT_PUBLIC_API_URL`, rồi khởi động container.

Nếu cần xem log build rõ hơn:

```bash
docker compose build frontend-dashboard
```

## 6. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f frontend-dashboard
```

Log này hữu ích khi kiểm tra lỗi start Next.js standalone server, lỗi runtime khi rewrite API hoặc lỗi liên quan biến môi trường dashboard.

## 7. Cách truy cập

Theo Compose:

```yaml
ports:
  - "${DASHBOARD_PORT:-3001}:3000"
```

Nếu không override `DASHBOARD_PORT`, truy cập dashboard tại:

```text
http://localhost:3001
```

Nếu đã đặt `DASHBOARD_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<DASHBOARD_PORT>
```

Ví dụ nếu đặt `DASHBOARD_PORT=3003`, URL local là:

```text
http://localhost:3003
```

## 8. Quan hệ với backend

Service `frontend-dashboard` phụ thuộc `backend`:

```yaml
depends_on:
  - backend
```

Ý nghĩa:

- Docker Compose start `backend` trước `frontend-dashboard`.
- `depends_on` dạng danh sách không chờ backend `healthy`.
- Dashboard gọi API backend thông qua `/api` cùng origin và rewrite trong Next.js.
- Trong Docker network, hostname backend là `backend` và port container là `5000`.

Nếu backend chưa sẵn sàng, dashboard vẫn có thể mở được nhưng các request API, đăng nhập hoặc dữ liệu quản trị có thể lỗi.

## 9. Lỗi thường gặp

### 9.1. Port 3001 bị chiếm

- Dấu hiệu: `docker compose up -d frontend-dashboard` thất bại, output báo không bind được port `3001` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có app khác hoặc container khác đang dùng port `3001`.
- Cách xử lý: Đổi `DASHBOARD_PORT` trong `docker-compose/.env`, ví dụ:

  ```env
  DASHBOARD_PORT=3003
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d frontend-dashboard
  docker compose ps frontend-dashboard
  ```

  Truy cập bằng port mới, ví dụ `http://localhost:3003`.

### 9.2. Dashboard build fail

- Dấu hiệu: `docker compose up -d --build frontend-dashboard` hoặc `docker compose build frontend-dashboard` thất bại ở bước `npm ci` hoặc `npm run build`.
- Nguyên nhân: Dockerfile chạy `npm ci`, copy source, rồi chạy `npm run build`. Lỗi có thể đến từ dependency, TypeScript, Next.js build hoặc biến môi trường build không phù hợp.
- Cách xử lý: Build riêng để xem log đầy đủ:

  ```bash
  cd docker-compose
  docker compose build frontend-dashboard
  ```

  Nếu lỗi liên quan API URL hoặc rewrite, kiểm tra build arg:

  ```yaml
  args:
    - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://backend:5000/api}
  ```

### 9.3. Không đăng nhập admin được

- Dấu hiệu: Trang đăng nhập trả lỗi, đăng nhập xong bị quay lại trạng thái chưa đăng nhập, hoặc request sau login trả `401`.
- Nguyên nhân: Dashboard dùng axios `baseURL: '/api'`, `withCredentials: true` và refresh token qua `/api/auth/refresh-token`. Nếu backend chưa chạy, CORS origin không khớp, cookie không được lưu/gửi, hoặc secret JWT/auth backend thiếu, luồng đăng nhập sẽ lỗi.
- Cách xử lý: Kiểm tra backend và dashboard:

  ```bash
  docker compose ps backend
  docker compose logs -f backend
  docker compose logs -f frontend-dashboard
  ```

  Nếu chạy qua `http://localhost:3001`, đảm bảo backend Compose đang cho phép origin mặc định:

  ```yaml
  - Cors__AllowedOrigins__1=${FRONTEND_URL_2:-http://localhost:3001}
  ```

  Nếu đã đổi `DASHBOARD_PORT`, cần đổi `FRONTEND_URL_2` cho khớp.

### 9.4. Không gọi được backend API

- Dấu hiệu: Dashboard mở được nhưng dữ liệu không tải, request API lỗi trong browser console, hoặc log dashboard có lỗi proxy/rewrite.
- Nguyên nhân: Backend chưa sẵn sàng, rewrite `/api` không tới được backend, hoặc `NEXT_PUBLIC_API_URL` sai so với ngữ cảnh chạy container.
- Cách xử lý: Kiểm tra backend health:

  ```bash
  docker compose ps backend
  curl http://localhost:5000/api/health
  docker compose logs -f backend
  ```

  Kiểm tra dashboard log:

  ```bash
  docker compose logs -f frontend-dashboard
  ```

  Với Compose mặc định, rewrite `/api` nên trỏ tới:

  ```text
  http://backend:5000/api
  ```

### 9.5. `NEXT_PUBLIC_API_URL` sai

- Dấu hiệu: Next.js rewrite hoặc server-side request gọi sai host, ví dụ gọi `localhost:5000` từ bên trong container dashboard và không tới được backend.
- Nguyên nhân: `.env` ghi đè default Compose. `docker-compose/.env.example` có `NEXT_PUBLIC_API_URL=http://localhost:5000/api`; giá trị này dễ sai khi dashboard chạy trong container vì `localhost` là container dashboard.
- Cách xử lý: Khi chạy dashboard và backend cùng Docker Compose network, dùng:

  ```env
  NEXT_PUBLIC_API_URL=http://backend:5000/api
  ```

  Sau khi đổi biến này, rebuild dashboard vì Compose truyền biến vào build args:

  ```bash
  docker compose up -d --build frontend-dashboard
  ```

### 9.6. Lỗi CORS/cookie/auth

- Dấu hiệu: Browser chặn request do CORS, cookie auth không được gửi, refresh token thất bại, hoặc dashboard liên tục redirect về login.
- Nguyên nhân: Backend Compose mặc định cho phép dashboard origin `http://localhost:3001` qua `Cors__AllowedOrigins__1`. Nếu đổi `DASHBOARD_PORT`, origin browser đổi nhưng backend vẫn cho phép origin cũ. Ngoài ra backend đang set `CookieSettings__ForceSecure=true`, có thể ảnh hưởng cookie khi chạy HTTP local.
- Cách xử lý: Nếu đổi `DASHBOARD_PORT`, cập nhật `FRONTEND_URL_2` trong `.env`, ví dụ:

  ```env
  DASHBOARD_PORT=3003
  FRONTEND_URL_2=http://localhost:3003
  ```

  Sau đó restart backend và dashboard:

  ```bash
  docker compose restart backend frontend-dashboard
  ```

  Nếu lỗi liên quan cookie secure khi chạy HTTP local, cần kiểm tra cấu hình backend `CookieSettings__ForceSecure` trong `docker-compose.yml`.

### 9.7. Backend chưa healthy

- Dấu hiệu: `frontend-dashboard` container đã chạy nhưng đăng nhập hoặc request API lỗi; `docker compose ps backend` không hiển thị `healthy`.
- Nguyên nhân: `frontend-dashboard` chỉ có `depends_on: - backend`, không chờ backend healthcheck pass. Backend có thể đang migration, thiếu `JWT_SECRET_KEY`, thiếu `AUTH_TOKEN_HASH_SECRET`, lỗi database hoặc healthcheck `/api/health` fail.
- Cách xử lý: Kiểm tra backend trước khi debug dashboard:

  ```bash
  docker compose ps backend
  docker compose logs -f backend
  curl http://localhost:5000/api/health
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.

### 9.8. Browser không resolve được hostname `backend`

- Dấu hiệu: Browser console báo lỗi DNS hoặc network khi request tới `http://backend:5000/api`.
- Nguyên nhân: `backend` là hostname nội bộ của Docker Compose network. Browser chạy trên máy host không nằm trong network này nên thường không resolve được hostname `backend`.
- Cách xử lý: Không gọi trực tiếp `http://backend:5000/api` từ browser. Với code dashboard hiện tại, request chính nên dùng same-origin:

  ```text
  /api
  ```

  rồi để Next.js rewrite sang backend trong container. Nếu cần browser gọi backend trực tiếp từ máy host, dùng host-mapped URL:

  ```text
  http://localhost:5000/api
  ```

  Khi dùng cách gọi trực tiếp này, cần kiểm tra lại CORS, cookie và auth.

### 9.9. Nhầm lẫn khi dùng `docker compose down -v`

- Dấu hiệu: Sau khi reset stack, dữ liệu database, cache, index search hoặc cấu hình dashboard local của các service khác bị mất dù chỉ đang debug `frontend-dashboard`.
- Nguyên nhân: Service `frontend-dashboard` không khai báo named volume riêng trong `docker-compose.yml`, nhưng lệnh dưới đây chạy ở cấp toàn Docker Compose project và có thể xóa các named volume của stack:

  ```bash
  docker compose down -v
  ```

  Các volume dữ liệu liên quan gồm `postgres_data`, `redis_data`, `elasticsearch_data`, `prometheus_data` và `grafana_data`.

- Cách xử lý: Nếu chỉ muốn rebuild hoặc restart dashboard, không dùng `down -v`. Chạy từ thư mục `docker-compose`:

  ```bash
  cd docker-compose
  docker compose restart frontend-dashboard
  docker compose up -d --build frontend-dashboard
  ```

  Chỉ dùng `docker compose down -v` khi muốn reset toàn bộ dữ liệu local của stack.
