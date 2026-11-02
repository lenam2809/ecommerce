Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service grafana

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`grafana` là service dùng để xem dashboard quan sát hệ thống e-commerce khi chạy bằng Docker Compose.

Grafana dùng để:

- Xem dashboard metrics dưới dạng biểu đồ, bảng, gauge hoặc các panel trực quan.
- Trực quan hóa dữ liệu metrics lấy từ Prometheus.
- Liên kết với Jaeger để xem trace nếu datasource Jaeger đã được cấu hình.
- Giúp developer theo dõi request, lỗi, độ trễ và các tín hiệu vận hành khác nếu backend đã xuất metrics/trace tương ứng.

Trong cấu hình hiện tại, Grafana được provision sẵn datasource Prometheus, datasource Jaeger và một dashboard tên `Ecommerce Observability`.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `grafana` trong `docker-compose/docker-compose.yml`:

- `image`: `grafana/grafana:10.4.3`

  Sử dụng Grafana phiên bản `10.4.3`.

- `container_name`: `ecommerce-grafana`

  Tên container cố định khi Docker Compose tạo container Grafana.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `environment`:

  ```yaml
  - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
  - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
  - GF_USERS_ALLOW_SIGN_UP=false
  ```

  Cấu hình tài khoản admin mặc định và tắt đăng ký tài khoản tự do.

- `ports`:

  ```yaml
  - "${GRAFANA_PORT:-3002}:3000"
  ```

  Port host mặc định là `3002`, map vào port `3000` trong container Grafana.

- `volumes`:

  ```yaml
  - grafana_data:/var/lib/grafana
  - ./observability/grafana/provisioning:/etc/grafana/provisioning:ro
  - ./observability/grafana/dashboards:/var/lib/grafana/dashboards:ro
  ```

  `grafana_data` lưu dữ liệu runtime của Grafana. Hai thư mục provisioning và dashboards được mount read-only từ source code.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Grafana nằm trong network nội bộ `ecommerce-network`, nên có thể gọi Prometheus bằng `http://prometheus:9090` và Jaeger bằng `http://jaeger:16686`.

- `depends_on`:

  ```yaml
  depends_on:
    - prometheus
    - jaeger
  ```

  Compose start `prometheus` và `jaeger` trước `grafana`. Dạng `depends_on` này không chờ healthcheck.

## 3. Tài khoản đăng nhập

Theo Compose:

```yaml
environment:
  - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
  - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
  - GF_USERS_ALLOW_SIGN_UP=false
```

Thông tin mặc định nếu không override:

| Biến | Giá trị mặc định | Ý nghĩa |
|---|---|---|
| `GRAFANA_ADMIN_USER` | `admin` | Username admin ban đầu của Grafana. |
| `GRAFANA_ADMIN_PASSWORD` | `admin` | Password admin ban đầu của Grafana. |
| `GF_USERS_ALLOW_SIGN_UP` | `false` | Không cho người dùng tự đăng ký tài khoản qua UI. |

Cảnh báo bảo mật:

- Không dùng password mặc định `admin` khi deploy thật.
- Nên đặt `GRAFANA_ADMIN_PASSWORD` trong `.env` bằng mật khẩu mạnh.
- Không commit mật khẩu thật vào git.
- Nếu volume `grafana_data` đã được tạo trước đó, đổi `GRAFANA_ADMIN_PASSWORD` trong `.env` có thể không đổi password admin hiện có. Khi đó cần đổi password trong Grafana UI/CLI hoặc reset volume nếu chấp nhận mất dữ liệu local.

## 4. File provisioning và dashboard

Compose mount:

```yaml
- ./observability/grafana/provisioning:/etc/grafana/provisioning:ro
- ./observability/grafana/dashboards:/var/lib/grafana/dashboards:ro
```

Các file hiện có:

```text
docker-compose/observability/grafana/provisioning/datasources/datasources.yml
docker-compose/observability/grafana/provisioning/dashboards/dashboards.yml
docker-compose/observability/grafana/dashboards/ecommerce-observability.json
```

### Datasource provisioning

File `datasources.yml` cấu hình 2 datasource:

| Datasource | Type | URL nội bộ | Ghi chú |
|---|---|---|---|
| `Prometheus` | `prometheus` | `http://prometheus:9090` | `isDefault: true`, là datasource mặc định cho dashboard metrics. |
| `Jaeger` | `jaeger` | `http://jaeger:16686` | Dùng để liên kết/xem trace từ Jaeger nếu dữ liệu trace có sẵn. |

Nội dung chính:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
```

### Dashboard provisioning

File `dashboards.yml` cấu hình provider:

| Thuộc tính | Giá trị |
|---|---|
| Provider name | `Ecommerce` |
| Folder | `Ecommerce` |
| Type | `file` |
| Path | `/var/lib/grafana/dashboards` |
| Update interval | `30` giây |

Điều này nghĩa là Grafana tự load dashboard JSON trong thư mục:

```text
/var/lib/grafana/dashboards
```

Thư mục này được mount từ:

```text
docker-compose/observability/grafana/dashboards
```

### Dashboard được load tự động

File dashboard hiện có:

```text
docker-compose/observability/grafana/dashboards/ecommerce-observability.json
```

Dashboard này có:

- Title: `Ecommerce Observability`
- UID: `ecommerce-observability`
- Tags: `ecommerce`, `observability`
- Refresh: `10s`
- Time range mặc định: `now-1h` đến `now`
- Link ngoài đến Jaeger UI:

  ```text
  http://localhost:16686/search?service=ecommerce-api
  ```

Các panel được khai báo trong dashboard:

| Panel | Type | Datasource | Query/metric trong file |
|---|---|---|---|
| `Requests Realtime` | `timeseries` | Prometheus | `sum(rate(ecommerce_http_requests_total[1m]))` |
| `Error Rate` | `timeseries` | Prometheus | `ecommerce_http_request_errors_total`, `ecommerce_http_requests_total` |
| `Top 5 Slowest Endpoints` | `bargauge` | Prometheus | `ecommerce_http_request_duration_ms_sum`, `ecommerce_http_request_duration_ms_count` |
| `Top 5 Error Types` | `bargauge` | Prometheus | `ecommerce_http_request_errors_total` |
| `Slow Application Methods` | `timeseries` | Prometheus | `ecommerce_slow_methods_total` |

Các metric name trên được lấy trực tiếp từ dashboard JSON. Nếu backend không xuất các metric này hoặc Prometheus chưa scrape được backend, dashboard có thể trống dù Grafana vẫn chạy bình thường.

## 5. Cách khởi động Grafana

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d grafana
```

Lệnh này khởi động `grafana` và các service trong `depends_on` nếu chúng chưa chạy.

## 6. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f grafana
```

Log Grafana hữu ích khi kiểm tra lỗi đăng nhập, lỗi provisioning datasource, lỗi load dashboard JSON hoặc lỗi quyền ghi vào volume.

## 7. Cách truy cập UI

Theo Compose:

```yaml
ports:
  - "${GRAFANA_PORT:-3002}:3000"
```

Nếu không override `GRAFANA_PORT`, truy cập Grafana UI tại:

```text
http://localhost:3002
```

Nếu đã đặt `GRAFANA_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<GRAFANA_PORT>
```

Tài khoản mặc định nếu chưa override:

```text
Username: admin
Password: admin
```

## 8. Quan hệ với Prometheus và Jaeger

Theo Compose, Grafana phụ thuộc:

```yaml
depends_on:
  - prometheus
  - jaeger
```

Ý nghĩa:

- Docker Compose start `prometheus` và `jaeger` trước `grafana`.
- `depends_on` dạng danh sách không chờ Prometheus hoặc Jaeger sẵn sàng hoàn toàn.
- Grafana đọc datasource từ provisioning:

  ```text
  Prometheus -> http://prometheus:9090
  Jaeger -> http://jaeger:16686
  ```

Trong Docker network:

- `prometheus` là hostname nội bộ của service Prometheus.
- `jaeger` là hostname nội bộ của service Jaeger.
- Grafana dùng `access: proxy`, nghĩa là Grafana server trong container gọi datasource qua network nội bộ, không phải browser gọi trực tiếp các URL này.

Nếu Prometheus hoặc Jaeger chưa chạy, Grafana UI vẫn có thể mở được nhưng datasource test hoặc dashboard sẽ lỗi/trống.

## 9. Dữ liệu Grafana lưu ở đâu

Grafana lưu dữ liệu runtime trong named volume:

```text
grafana_data
```

Compose mount volume này vào:

```text
/var/lib/grafana
```

Cấu hình trong Compose:

```yaml
volumes:
  - grafana_data:/var/lib/grafana
```

Dữ liệu trong volume có thể bao gồm database nội bộ của Grafana, trạng thái datasource/dashboard đã provision, user/session và các thay đổi trong UI.

Nhờ volume này, dữ liệu Grafana vẫn còn sau khi xóa container bằng:

```bash
docker compose down
```

Cảnh báo: lệnh dưới đây có thể xóa `grafana_data` và làm mất dữ liệu Grafana local:

```bash
docker compose down -v
```

## 10. Lỗi thường gặp

### 10.1. Không đăng nhập được

- Dấu hiệu: Mở Grafana UI được nhưng đăng nhập bằng `admin/admin` không thành công.
- Nguyên nhân: Volume `grafana_data` có thể đã giữ password admin cũ. Grafana chỉ dùng `GF_SECURITY_ADMIN_USER` và `GF_SECURITY_ADMIN_PASSWORD` khi khởi tạo dữ liệu lần đầu.
- Cách xử lý: Nếu còn nhớ password cũ, đăng nhập và đổi trong UI. Nếu chỉ là môi trường local và chấp nhận mất dữ liệu Grafana, reset volume:

  ```bash
  docker compose down -v
  docker compose up -d grafana
  ```

  Lưu ý `docker compose down -v` có thể xóa volume của nhiều service trong stack, không chỉ `grafana_data`.

### 10.2. Port 3002 bị chiếm

- Dấu hiệu: `docker compose up -d grafana` thất bại, output báo không bind được port `3002` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có service khác đang dùng port `3002`.
- Cách xử lý: Đổi `GRAFANA_PORT` trong `.env`, ví dụ:

  ```env
  GRAFANA_PORT=3003
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d grafana
  docker compose ps grafana
  ```

  Truy cập bằng:

  ```text
  http://localhost:3003
  ```

### 10.3. Không thấy datasource

- Dấu hiệu: Vào Grafana UI nhưng không thấy datasource `Prometheus` hoặc `Jaeger`.
- Nguyên nhân: Grafana không đọc được provisioning folder, file `datasources.yml` lỗi YAML, mount sai đường dẫn, hoặc volume cũ giữ trạng thái provision không như mong đợi.
- Cách xử lý: Kiểm tra file trên host:

  ```text
  docker-compose/observability/grafana/provisioning/datasources/datasources.yml
  ```

  Xem log:

  ```bash
  docker compose logs -f grafana
  ```

  Kiểm tra Compose mount đúng:

  ```yaml
  - ./observability/grafana/provisioning:/etc/grafana/provisioning:ro
  ```

### 10.4. Không thấy dashboard

- Dấu hiệu: Grafana UI mở được, datasource có thể có, nhưng không thấy dashboard `Ecommerce Observability`.
- Nguyên nhân: File dashboard JSON không được mount, provider không load path đúng, dashboard JSON lỗi, hoặc đang xem sai folder trong Grafana.
- Cách xử lý: Kiểm tra provider:

  ```text
  docker-compose/observability/grafana/provisioning/dashboards/dashboards.yml
  ```

  Provider hiện load dashboard từ:

  ```text
  /var/lib/grafana/dashboards
  ```

  Kiểm tra file dashboard trên host:

  ```text
  docker-compose/observability/grafana/dashboards/ecommerce-observability.json
  ```

  Xem log Grafana:

  ```bash
  docker compose logs -f grafana
  ```

### 10.5. Prometheus datasource lỗi

- Dấu hiệu: Dashboard mở được nhưng panel trống, datasource test lỗi, hoặc Grafana báo không kết nối được Prometheus.
- Nguyên nhân: Prometheus chưa chạy, Prometheus không cùng network, hoặc datasource URL sai. File provisioning đang cấu hình:

  ```yaml
  name: Prometheus
  type: prometheus
  url: http://prometheus:9090
  ```

- Cách xử lý: Kiểm tra Prometheus:

  ```bash
  docker compose ps prometheus grafana
  docker compose logs -f prometheus
  docker compose logs -f grafana
  ```

  Truy cập Prometheus từ máy host nếu không override port:

  ```text
  http://localhost:9090
  ```

  Nếu Prometheus UI không mở được hoặc target backend `DOWN`, cần xử lý Prometheus trước.

### 10.6. Jaeger datasource lỗi

- Dấu hiệu: Datasource Jaeger test lỗi, link trace không mở được dữ liệu trace, hoặc Grafana không kết nối được Jaeger.
- Nguyên nhân: Jaeger chưa chạy, datasource URL sai, hoặc backend chưa gửi trace. File provisioning đang cấu hình:

  ```yaml
  name: Jaeger
  type: jaeger
  url: http://jaeger:16686
  ```

- Cách xử lý: Kiểm tra Jaeger:

  ```bash
  docker compose ps jaeger grafana
  docker compose logs -f jaeger
  docker compose logs -f grafana
  ```

  Truy cập Jaeger UI từ máy host nếu không override port:

  ```text
  http://localhost:16686
  ```

  Nếu Jaeger UI chạy nhưng không có trace, kiểm tra backend có gửi trace đến `http://jaeger:4317` hay không.

### 10.7. Volume cũ giữ password cũ

- Dấu hiệu: Đã đổi `GRAFANA_ADMIN_PASSWORD` trong `.env` nhưng Grafana vẫn không nhận password mới.
- Nguyên nhân: `grafana_data` đã có database nội bộ từ lần chạy trước. Grafana không reset admin password chỉ vì đổi biến môi trường sau khi dữ liệu đã tồn tại.
- Cách xử lý: Đổi password trong UI/CLI nếu cần giữ dữ liệu. Nếu chỉ là local và chấp nhận mất dữ liệu Grafana, reset bằng:

  ```bash
  docker compose down -v
  docker compose up -d grafana
  ```

  Sau đó đăng nhập lại bằng giá trị `GRAFANA_ADMIN_USER` và `GRAFANA_ADMIN_PASSWORD` hiện tại.

### 10.8. Dashboard có panel nhưng không có dữ liệu

- Dấu hiệu: Dashboard `Ecommerce Observability` xuất hiện nhưng các panel trống hoặc báo no data.
- Nguyên nhân: Dashboard đang query các metric như `ecommerce_http_requests_total`, `ecommerce_http_request_errors_total`, `ecommerce_http_request_duration_ms_sum`, `ecommerce_http_request_duration_ms_count`, `ecommerce_slow_methods_total`. Nếu backend chưa expose các metric này, Prometheus chưa scrape được backend, hoặc chưa có traffic, panel sẽ trống.
- Cách xử lý: Kiểm tra Prometheus target:

  ```text
  http://localhost:9090
  Status -> Targets
  ```

  Kiểm tra backend metrics:

  ```bash
  curl http://localhost:5000/metrics
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.
