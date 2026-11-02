Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service jaeger

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`jaeger` là service distributed tracing của hệ thống e-commerce khi chạy bằng Docker Compose.

Tracing là cách ghi lại hành trình của một request khi nó đi qua backend và các thành phần liên quan. Thay vì chỉ xem từng dòng log rời rạc, trace giúp developer nhìn được một request mất thời gian ở bước nào, có gọi database/cache/search hay HTTP dependency nào, và lỗi phát sinh ở đoạn nào trong luồng xử lý.

Trong dự án này, Jaeger dùng để:

- Thu thập distributed trace từ backend.
- Theo dõi request đi qua service `backend`.
- Hỗ trợ debug hiệu năng, ví dụ request chậm do xử lý backend, database, Redis, Elasticsearch hoặc HTTP call.
- Hỗ trợ debug lỗi request bằng cách xem trace theo từng span nếu backend gửi trace thành công.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `jaeger` trong `docker-compose/docker-compose.yml`:

- `image`: `jaegertracing/all-in-one:1.57`

  Dùng image Jaeger all-in-one. Image này gom các thành phần cần thiết cho tracing local vào một container, phù hợp môi trường phát triển.

- `container_name`: `ecommerce-jaeger`

  Tên container cố định khi Docker Compose tạo container Jaeger.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `environment`:

  ```yaml
  - COLLECTOR_OTLP_ENABLED=true
  ```

  Bật OTLP collector trong Jaeger để nhận trace qua giao thức OpenTelemetry.

- `ports`:

  ```yaml
  - "${JAEGER_UI_PORT:-16686}:16686"
  - "4317:4317"
  - "4318:4318"
  ```

  Compose expose Jaeger UI và hai port OTLP ra máy host.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Service nằm trong network nội bộ `ecommerce-network`, để backend có thể gửi trace đến Jaeger bằng hostname `jaeger`.

## 3. Port quan trọng

| Port | Mapping trong Compose | Vai trò | Ghi chú |
|---|---|---|---|
| UI `16686` | `${JAEGER_UI_PORT:-16686}:16686` | Giao diện web Jaeger để xem trace. | Port host mặc định là `16686`. Có thể override bằng biến `JAEGER_UI_PORT` trong `.env`. |
| OTLP gRPC `4317` | `4317:4317` | Endpoint nhận trace OTLP qua gRPC. | Backend đang gửi trace đến `http://jaeger:4317` trong Docker network. Port host được expose cố định là `4317`. |
| OTLP HTTP `4318` | `4318:4318` | Endpoint nhận trace OTLP qua HTTP. | Compose expose port này, nhưng backend hiện đang cấu hình endpoint `4317`. |

Khi truy cập từ máy host, dùng port host. Khi backend trong container gửi trace đến Jaeger, backend dùng tên service và port nội bộ:

```text
http://jaeger:4317
```

## 4. Cách khởi động Jaeger

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d jaeger
```

Lệnh này khởi động riêng service `jaeger` cùng network cần thiết.

## 5. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f jaeger
```

Log Jaeger hữu ích khi kiểm tra container có start được không, OTLP collector có bật không, hoặc port có bị lỗi bind không.

## 6. Cách truy cập UI

Theo Compose:

```yaml
ports:
  - "${JAEGER_UI_PORT:-16686}:16686"
```

Nếu không override `JAEGER_UI_PORT`, truy cập Jaeger UI tại:

```text
http://localhost:16686
```

Nếu đã đặt `JAEGER_UI_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<JAEGER_UI_PORT>
```

Ví dụ nếu đặt:

```env
JAEGER_UI_PORT=16687
```

thì URL local là:

```text
http://localhost:16687
```

## 7. Backend gửi trace sang Jaeger như thế nào

Trong service `backend`, Compose khai báo:

```yaml
- Observability__ServiceName=ecommerce-api
- Observability__ServiceVersion=${APP_VERSION:-1.0.0}
- Observability__OtlpEndpoint=http://jaeger:4317
```

Backend đọc `Observability__OtlpEndpoint` và gửi OpenTelemetry trace đến:

```text
http://jaeger:4317
```

Điểm quan trọng:

- `jaeger` là hostname nội bộ trong Docker Compose network, không phải hostname của máy host.
- `4317` là OTLP gRPC port được service Jaeger expose.
- Không dùng `localhost:4317` từ container backend, vì `localhost` bên trong backend container là chính container backend.
- `backend` có `depends_on` với `jaeger` theo điều kiện `service_started`, nghĩa là Docker Compose chỉ chờ Jaeger container bắt đầu chạy, không chờ một healthcheck Jaeger.

Từ file backend, `Program.cs` có cấu hình OpenTelemetry và gọi OTLP exporter bằng `observabilityOptions.OtlpEndpoint`. Vì vậy nếu endpoint sai hoặc Jaeger không nhận được trace, cần kiểm tra cả log backend và log Jaeger.

## 8. Lỗi thường gặp

### 8.1. Không truy cập được UI

- Dấu hiệu: Mở `http://localhost:16686` không được, browser báo không kết nối được hoặc connection refused.
- Nguyên nhân: Container `jaeger` chưa chạy, port host không phải `16686` do đã override `JAEGER_UI_PORT`, hoặc port `16686` bị chiếm lúc start container.
- Cách xử lý: Kiểm tra trạng thái và port:

  ```bash
  docker compose ps jaeger
  docker compose logs -f jaeger
  ```

  Nếu đã đặt `JAEGER_UI_PORT`, truy cập bằng port đã đặt:

  ```text
  http://localhost:<JAEGER_UI_PORT>
  ```

### 8.2. Backend không gửi trace

- Dấu hiệu: Backend vẫn chạy nhưng Jaeger UI không có trace mới sau khi gọi API.
- Nguyên nhân: Backend chưa chạy, backend chưa nhận request, `Observability__OtlpEndpoint` sai, hoặc Jaeger chưa sẵn sàng nhận OTLP. Compose cấu hình backend gửi đến `http://jaeger:4317`.
- Cách xử lý: Kiểm tra backend và Jaeger:

  ```bash
  docker compose ps backend jaeger
  docker compose logs -f backend
  docker compose logs -f jaeger
  ```

  Kiểm tra trong Compose backend có dòng:

  ```yaml
  - Observability__OtlpEndpoint=http://jaeger:4317
  ```

  Sau đó gọi một request backend để tạo trace, ví dụ health endpoint:

  ```bash
  curl http://localhost:5000/api/health
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.

### 8.3. Sai OTLP endpoint

- Dấu hiệu: Log backend có lỗi export trace, lỗi kết nối OTLP, hoặc Jaeger không nhận trace.
- Nguyên nhân: Backend dùng endpoint không đúng với Docker network. Từ container backend, endpoint đúng theo Compose là `http://jaeger:4317`; `localhost:4317` sẽ trỏ về chính container backend.
- Cách xử lý: Giữ cấu hình backend:

  ```text
  http://jaeger:4317
  ```

  Nếu có override biến observability trong `.env` hoặc môi trường deploy, đảm bảo không đổi thành `localhost:4317` khi backend chạy trong Docker Compose.

### 8.4. Port 16686 bị chiếm

- Dấu hiệu: `docker compose up -d jaeger` thất bại, output báo không bind được port `16686` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Jaeger khác hoặc service khác đang dùng port `16686`.
- Cách xử lý: Đổi port host UI bằng `JAEGER_UI_PORT` trong `.env`, ví dụ:

  ```env
  JAEGER_UI_PORT=16687
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d jaeger
  docker compose ps jaeger
  ```

  Truy cập UI bằng:

  ```text
  http://localhost:16687
  ```

### 8.5. Jaeger chạy nhưng không có dữ liệu trace

- Dấu hiệu: Jaeger UI mở được nhưng không thấy trace mới sau khi thao tác với hệ thống.
- Nguyên nhân: Backend chưa gửi trace, chưa có request đi qua backend, chọn sai service trong UI, hoặc dữ liệu trace chưa được export thành công. Service name backend trong Compose là `ecommerce-api`.
- Cách xử lý: Tạo request đến backend:

  ```bash
  curl http://localhost:5000/api/health
  ```

  Sau đó xem log:

  ```bash
  docker compose logs -f backend
  docker compose logs -f jaeger
  ```

  Trong UI, tìm service theo tên được backend cấu hình:

  ```text
  ecommerce-api
  ```

  Nếu vẫn không có dữ liệu, cần kiểm tra thêm cấu hình OpenTelemetry trong backend và lỗi exporter trong log backend.

### 8.6. Port 4317 hoặc 4318 bị chiếm

- Dấu hiệu: `docker compose up -d jaeger` thất bại dù UI port không bị chiếm.
- Nguyên nhân: Compose expose cố định:

  ```yaml
  - "4317:4317"
  - "4318:4318"
  ```

  Nếu máy host đã có collector hoặc service khác dùng `4317`/`4318`, Docker không bind được port.

- Cách xử lý: Dừng service đang chiếm port, hoặc sửa mapping port host trong `docker-compose.yml`. Khi backend chạy trong Docker network, backend vẫn nên gửi đến port nội bộ:

  ```text
  http://jaeger:4317
  ```

  Nếu chỉ đổi port host, không cần đổi `Observability__OtlpEndpoint` của backend trong Compose.

### 8.7. Nhầm lẫn khi dùng `docker compose down -v`

- Dấu hiệu: Sau khi reset stack, dữ liệu database, cache, index search, metrics hoặc cấu hình Grafana local bị mất dù chỉ đang debug Jaeger.
- Nguyên nhân: Service `jaeger` trong `docker-compose.yml` không khai báo named volume riêng; trace của Jaeger all-in-one trong cấu hình hiện tại không được lưu vào volume bền vững. Tuy vậy, lệnh dưới đây chạy ở cấp toàn Docker Compose project và có thể xóa các named volume của service khác:

  ```bash
  docker compose down -v
  ```

  Các volume dữ liệu liên quan gồm `postgres_data`, `redis_data`, `elasticsearch_data`, `prometheus_data` và `grafana_data`.

- Cách xử lý: Nếu chỉ muốn restart Jaeger, chạy từ thư mục `docker-compose`:

  ```bash
  cd docker-compose
  docker compose restart jaeger
  ```

  Chỉ dùng `docker compose down -v` khi muốn reset toàn bộ dữ liệu local của stack.
