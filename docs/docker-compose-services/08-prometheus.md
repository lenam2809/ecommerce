Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service prometheus

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`prometheus` là service thu thập và lưu trữ metrics của hệ thống e-commerce khi chạy bằng Docker Compose.

Prometheus dùng để:

- Thu thập metrics từ backend theo cấu hình scrape trong `prometheus.yml`.
- Theo dõi tình trạng backend/service thông qua target scrape và dữ liệu time series.
- Cung cấp dữ liệu metrics cho Grafana để vẽ dashboard.
- Kết hợp với Alertmanager để gửi cảnh báo khi alert rule trong `alerts.yml` thỏa điều kiện.

Trong cấu hình hiện tại, Prometheus đang lấy metrics từ service `backend` tại endpoint nội bộ:

```text
http://backend:5000/metrics
```

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `prometheus` trong `docker-compose/docker-compose.yml`:

- `image`: `prom/prometheus:v2.52.0`

  Sử dụng Prometheus phiên bản `v2.52.0`.

- `container_name`: `ecommerce-prometheus`

  Tên container cố định khi Docker Compose tạo container Prometheus.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `command`:

  ```yaml
  - "--config.file=/etc/prometheus/prometheus.yml"
  - "--storage.tsdb.retention.time=${PROMETHEUS_RETENTION:-30d}"
  ```

  Prometheus đọc config từ `/etc/prometheus/prometheus.yml`. Dữ liệu time series được giữ mặc định `30d` nếu không override `PROMETHEUS_RETENTION`.

- `ports`:

  ```yaml
  - "${PROMETHEUS_PORT:-9090}:9090"
  ```

  Port host mặc định là `9090`, map vào port `9090` trong container.

- `volumes`:

  ```yaml
  - ./observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
  - ./observability/prometheus/alerts.yml:/etc/prometheus/alerts.yml:ro
  - prometheus_data:/prometheus
  ```

  Hai file cấu hình được mount read-only. Dữ liệu Prometheus được lưu trong named volume `prometheus_data`.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Prometheus nằm trong network nội bộ `ecommerce-network`, nên có thể scrape backend bằng hostname `backend`.

- `depends_on`:

  ```yaml
  depends_on:
    - backend
    - alertmanager
  ```

  Compose start `backend` và `alertmanager` trước `prometheus`. Dạng `depends_on` này không chờ healthcheck.

## 3. File cấu hình Prometheus

Compose mount hai file cấu hình:

```yaml
- ./observability/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
- ./observability/prometheus/alerts.yml:/etc/prometheus/alerts.yml:ro
```

### `prometheus.yml`

File `docker-compose/observability/prometheus/prometheus.yml` hiện có:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - /etc/prometheus/alerts.yml

scrape_configs:
  - job_name: ecommerce-api
    metrics_path: /metrics
    static_configs:
      - targets:
          - backend:5000
```

Tóm tắt:

- `scrape_interval: 15s`: Prometheus scrape metrics mỗi 15 giây.
- `evaluation_interval: 15s`: Prometheus evaluate alert rules mỗi 15 giây.
- Alertmanager target: `alertmanager:9093`.
- Rule file: `/etc/prometheus/alerts.yml`.
- Scrape job duy nhất: `ecommerce-api`.
- Target của job `ecommerce-api`: `backend:5000`.
- Metrics path: `/metrics`, nghĩa là Prometheus scrape:

  ```text
  http://backend:5000/metrics
  ```

### `alerts.yml`

File `docker-compose/observability/prometheus/alerts.yml` hiện có group:

```yaml
groups:
  - name: ecommerce-api
```

Trong group này có 2 alert rule:

| Alert | Điều kiện trong config | Thời gian duy trì | Severity | Ý nghĩa |
|---|---|---|---|---|
| `EcommerceHighErrorRate` | Tỷ lệ `ecommerce_http_request_errors_total` trên `ecommerce_http_requests_total` trong 5 phút lớn hơn `0.01` | `5m` | `critical` | Cảnh báo khi tỷ lệ lỗi API lớn hơn 1% trong 5 phút. |
| `EcommerceHighAverageLatency` | Trung bình `ecommerce_http_request_duration_ms_sum / ecommerce_http_request_duration_ms_count` trong 5 phút lớn hơn `2000` | `5m` | `warning` | Cảnh báo khi thời gian phản hồi API trung bình lớn hơn 2 giây trong 5 phút. |

Các metric name trên được lấy trực tiếp từ `alerts.yml`. Nếu Prometheus không thấy các metric này trong `/metrics`, alert sẽ không có dữ liệu để đánh giá đúng.

## 4. Cách khởi động Prometheus

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d prometheus
```

Lệnh này khởi động `prometheus` và các service được khai báo trong `depends_on` nếu chúng chưa chạy.

## 5. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f prometheus
```

Log Prometheus hữu ích khi kiểm tra lỗi YAML config, lỗi load rule file, lỗi kết nối target hoặc lỗi gửi alert đến Alertmanager.

## 6. Cách truy cập UI

Theo Compose:

```yaml
ports:
  - "${PROMETHEUS_PORT:-9090}:9090"
```

Nếu không override `PROMETHEUS_PORT`, truy cập Prometheus UI tại:

```text
http://localhost:9090
```

Nếu đã đặt `PROMETHEUS_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<PROMETHEUS_PORT>
```

## 7. Cách kiểm tra target

Trong Prometheus UI:

1. Mở:

   ```text
   http://localhost:9090
   ```

2. Vào menu:

   ```text
   Status -> Targets
   ```

3. Kiểm tra job:

   ```text
   ecommerce-api
   ```

Ý nghĩa trạng thái target:

- `UP`: Prometheus scrape target thành công. Với cấu hình hiện tại, điều này nghĩa là Prometheus gọi được `backend:5000/metrics`.
- `DOWN`: Prometheus không scrape được target. Nguyên nhân thường là backend chưa chạy, backend chưa expose `/metrics`, sai network/host/port, hoặc target trả lỗi.

Nếu target `DOWN`, xem cột lỗi trong trang Targets và kiểm tra log:

```bash
docker compose logs -f prometheus
docker compose logs -f backend
```

## 8. Quan hệ với backend và alertmanager

Theo `depends_on`, Prometheus phụ thuộc:

```yaml
depends_on:
  - backend
  - alertmanager
```

Theo `prometheus.yml`, Prometheus lấy metrics từ backend:

```yaml
scrape_configs:
  - job_name: ecommerce-api
    metrics_path: /metrics
    static_configs:
      - targets:
          - backend:5000
```

Điều này nghĩa là trong Docker network, Prometheus gọi:

```text
http://backend:5000/metrics
```

Theo `prometheus.yml`, Prometheus gửi alert đến Alertmanager:

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
```

Điều này nghĩa là trong Docker network, Prometheus gửi alert đến:

```text
alertmanager:9093
```

Lưu ý: `depends_on` chỉ đảm bảo thứ tự start container, không đảm bảo backend đã có metrics hoặc Alertmanager đã xử lý alert thành công.

## 9. Dữ liệu lưu ở đâu

Prometheus lưu dữ liệu time series trong named volume:

```text
prometheus_data
```

Compose mount volume này vào:

```text
/prometheus
```

Cấu hình trong Compose:

```yaml
volumes:
  - prometheus_data:/prometheus
```

Nhờ volume này, dữ liệu metrics vẫn còn sau khi xóa container bằng:

```bash
docker compose down
```

Cảnh báo: lệnh dưới đây có thể xóa `prometheus_data` và làm mất dữ liệu metrics local:

```bash
docker compose down -v
```

## 10. Lỗi thường gặp

### 10.1. Prometheus không start do lỗi config YAML

- Dấu hiệu: Container `ecommerce-prometheus` thoát, restart liên tục hoặc log báo lỗi parse config.
- Nguyên nhân: File `docker-compose/observability/prometheus/prometheus.yml` sai YAML, sai indentation hoặc sai cấu trúc config.
- Cách xử lý: Xem log Prometheus:

  ```bash
  docker compose logs -f prometheus
  ```

  Kiểm tra lại file được mount:

  ```text
  docker-compose/observability/prometheus/prometheus.yml
  ```

  Sau khi sửa, restart Prometheus:

  ```bash
  docker compose restart prometheus
  ```

### 10.2. Target backend `DOWN`

- Dấu hiệu: Trong Prometheus UI, `Status -> Targets`, job `ecommerce-api` có trạng thái `DOWN`.
- Nguyên nhân: Prometheus không scrape được `backend:5000/metrics`. Backend có thể chưa chạy, chưa healthy, chưa expose metrics, hoặc Prometheus không gọi được backend trong network.
- Cách xử lý: Kiểm tra backend và Prometheus:

  ```bash
  docker compose ps backend prometheus
  docker compose logs -f backend
  docker compose logs -f prometheus
  ```

  Kiểm tra cấu hình target trong `prometheus.yml`:

  ```yaml
  targets:
    - backend:5000
  metrics_path: /metrics
  ```

### 10.3. Không đọc được `alerts.yml`

- Dấu hiệu: Prometheus start lỗi hoặc log báo không load được rule file `/etc/prometheus/alerts.yml`.
- Nguyên nhân: File `docker-compose/observability/prometheus/alerts.yml` không tồn tại, mount sai, YAML lỗi hoặc nội dung rule không hợp lệ.
- Cách xử lý: Kiểm tra file trên host:

  ```text
  docker-compose/observability/prometheus/alerts.yml
  ```

  Xem log:

  ```bash
  docker compose logs -f prometheus
  ```

  Sau khi sửa file, restart:

  ```bash
  docker compose restart prometheus
  ```

### 10.4. Port 9090 bị chiếm

- Dấu hiệu: `docker compose up -d prometheus` thất bại, output báo không bind được port `9090` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Prometheus khác hoặc service khác đang dùng port `9090`.
- Cách xử lý: Đổi `PROMETHEUS_PORT` trong `.env`, ví dụ:

  ```env
  PROMETHEUS_PORT=9091
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d prometheus
  docker compose ps prometheus
  ```

  Truy cập UI bằng:

  ```text
  http://localhost:9091
  ```

### 10.5. Không có metrics từ backend

- Dấu hiệu: Target có thể `DOWN`, hoặc query metrics không có dữ liệu liên quan backend.
- Nguyên nhân: Backend chưa expose `/metrics`, backend chưa nhận request sinh metrics, hoặc Prometheus scrape sai target/path. Cấu hình hiện tại chỉ scrape `backend:5000` với `metrics_path: /metrics`.
- Cách xử lý: Kiểm tra endpoint từ phía máy host qua backend mapped port:

  ```bash
  curl http://localhost:5000/metrics
  ```

  Nếu đã override `BACKEND_PORT`, thay `5000` bằng giá trị `BACKEND_PORT`.

  Sau đó kiểm tra Targets trong Prometheus UI:

  ```text
  Status -> Targets
  ```

  Nếu endpoint không tồn tại hoặc trả lỗi, cần kiểm tra thêm cấu hình metrics trong backend.

### 10.6. Alert không gửi sang Alertmanager

- Dấu hiệu: Alert rule đã firing trong Prometheus nhưng Alertmanager không nhận hoặc không hiển thị alert.
- Nguyên nhân: Prometheus không kết nối được `alertmanager:9093`, Alertmanager chưa chạy, hoặc cấu hình `alerting.alertmanagers` sai. Trong config hiện tại, target là `alertmanager:9093`.
- Cách xử lý: Kiểm tra hai service:

  ```bash
  docker compose ps prometheus alertmanager
  docker compose logs -f prometheus
  docker compose logs -f alertmanager
  ```

  Kiểm tra cấu hình trong `prometheus.yml`:

  ```yaml
  alerting:
    alertmanagers:
      - static_configs:
          - targets:
              - alertmanager:9093
  ```

### 10.7. Dữ liệu cũ do volume

- Dấu hiệu: Prometheus UI vẫn còn dữ liệu metrics cũ sau khi restart container hoặc sau khi thay đổi backend.
- Nguyên nhân: Dữ liệu time series nằm trong volume `prometheus_data`, không mất khi chỉ chạy `docker compose down`.
- Cách xử lý: Nếu muốn reset dữ liệu metrics local và chấp nhận mất lịch sử Prometheus, dùng:

  ```bash
  docker compose down -v
  docker compose up -d prometheus
  ```

  Lưu ý `docker compose down -v` có thể xóa volume của nhiều service trong stack, không chỉ `prometheus_data`.
