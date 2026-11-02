Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Hướng dẫn Docker Compose Services (11 Dịch Vụ Hoàn Chỉnh)

## 1. Mục tiêu tài liệu

Tài liệu này giúp developer mới vào dự án hiểu nhanh toàn bộ **11 service** đang được khai báo trong `docker-compose/docker-compose.yml`, vai trò của từng service, port host cần truy cập và các lệnh Docker Compose thường dùng khi phát triển.

Hệ thống hỗ trợ 2 chế độ khởi chạy:
- **Chế độ Hybrid (Mặc định `docker compose up -d`):** Chỉ chạy 3 dịch vụ hạ tầng nền tảng cốt lõi: `postgres` (5432), `redis` (6379), và `rabbitmq` (5672, 15672). Các ứng dụng backend, client, dashboard có thể chạy trực tiếp bằng lệnh CLI trên máy host (`dotnet run`, `npm run dev`) để dev nhanh và debug thuận tiện.
- **Chế độ Full Docker (`docker compose --profile full-docker up -d`):** Khởi chạy toàn bộ stack 11 dịch vụ hoàn chỉnh bao gồm backend, 2 frontend và trọn bộ công cụ giám sát quan sát (Observability: Jaeger, Prometheus, Alertmanager, Grafana) cùng Elasticsearch.

## 2. Danh sách 11 Service trong Docker Compose

Danh sách dưới đây được đối chiếu chính xác từ `docker-compose/docker-compose.yml`:

1. `postgres` (PostgreSQL Database)
2. `redis` (Redis Cache & Session)
3. `rabbitmq` (RabbitMQ Message Broker & Management)
4. `elasticsearch` (Search Engine với ICU Analyzer)
5. `backend` (.NET 8 Web API)
6. `frontend-client` (Next.js 15 Storefront)
7. `frontend-dashboard` (Next.js 15 Admin Dashboard)
8. `jaeger` (Distributed Tracing UI & Collector)
9. `prometheus` (Metrics Server)
10. `alertmanager` (Alert Management)
11. `grafana` (Observability Dashboard)

## 3. Sơ đồ Kiến trúc & Luồng Dữ liệu 11 Service

```text
frontend-client (:3000)      frontend-dashboard (:3001)
         \                         /
          \                       /
           v                     v
                backend (:5000)
             /       |        \
            v        v         v
     postgres      redis    rabbitmq
      (:5432)     (:6379)  (:5672 / :15672)
                     |
                     v
               elasticsearch (:9200)

backend  ───OTLP───> jaeger (:16686, :4317, :4318)
backend  ──metrics─> prometheus (:9090) ──alerts──> alertmanager (:9093)
grafana (:3002) ──queries──> prometheus & jaeger
```

**Luồng tương tác chính:**
- `frontend-client` (port 3000) và `frontend-dashboard` (port 3001) gọi REST API và SignalR WebSocket qua `backend` (port 5000).
- `backend` lưu trữ quan hệ và lịch sử giao dịch tại `postgres` (port 5432).
- `backend` sử dụng `redis` (port 6379) làm distributed cache dữ liệu sản phẩm, danh mục và session.
- `backend` kết nối `rabbitmq` (port 5672, quản trị web port 15672) phục vụ hàng đợi thông điệp bất đồng bộ (Message Broker).
- `backend` đồng bộ chỉ mục sản phẩm sang `elasticsearch` (port 9200) để phục vụ tìm kiếm mờ (fuzzy) và gợi ý (suggest).
- `backend` gửi dữ liệu phân tích vết (distributed traces) qua OTLP sang `jaeger`.
- `prometheus` thu thập định kỳ các metrics hiệu năng từ `backend` và kích hoạt cảnh báo tới `alertmanager`.
- `grafana` (port 3002) trực quan hóa toàn diện hệ thống từ dữ liệu của `prometheus` và `jaeger`.

## 4. Bảng Tổng Hợp 11 Service

| # | Service | Container name | Vai trò & Công nghệ | Port host | URL local / Endpoint | File tài liệu chi tiết |
|:---:|---|---|---|---|---|---|
| 1 | `postgres` | `ecommerce-postgres` | PostgreSQL 15 Database lưu trữ toàn bộ dữ liệu quan hệ chính của hệ thống. | `${POSTGRES_PORT:-5432}` | `localhost:5432` | [01-postgres.md](01-postgres.md) |
| 2 | `redis` | `ecommerce-redis` | Redis 7 Alpine, lưu distributed cache cho catalog và session. | `${REDIS_PORT:-6379}` | `redis://localhost:6379` | [02-redis.md](02-redis.md) |
| 3 | `rabbitmq` | `ecommerce-rabbitmq` | RabbitMQ 3.13 Management Alpine, Message Broker xử lý hàng đợi thông điệp. | `${RABBITMQ_PORT:-5672}`<br/>`${RABBITMQ_MANAGEMENT_PORT:-15672}` | Broker: `amqp://localhost:5672`<br/>UI: `http://localhost:15672` | [11-rabbitmq.md](11-rabbitmq.md) |
| 4 | `elasticsearch` | `ecommerce-elasticsearch` | Elasticsearch 8.16.3 build kèm ICU analyzer phục vụ tìm kiếm tiếng Việt. | `${ELASTICSEARCH_PORT:-9200}` | `http://localhost:9200` | [03-elasticsearch.md](03-elasticsearch.md) |
| 5 | `backend` | `ecommerce-backend` | ASP.NET Core 8 Web API, xử lý nghiệp vụ CQRS, auth, file uploads, SignalR hubs. | `${BACKEND_PORT:-5000}` | `http://localhost:5000` | [04-backend.md](04-backend.md) |
| 6 | `frontend-client` | `ecommerce-client` | Next.js 15 (React 19) storefront cho khách hàng mua sắm (27 routes). | `${CLIENT_PORT:-3000}` | `http://localhost:3000` | [05-frontend-client.md](05-frontend-client.md) |
| 7 | `frontend-dashboard` | `ecommerce-dashboard` | Next.js 15 (React 18.3.1) trang quản trị admin đa phân hệ (71 routes). | `${DASHBOARD_PORT:-3001}` | `http://localhost:3001` | [06-frontend-dashboard.md](06-frontend-dashboard.md) |
| 8 | `jaeger` | `ecommerce-jaeger` | Jaeger All-in-one 1.57 tiếp nhận OTLP traces và cung cấp giao diện truy vết. | `${JAEGER_UI_PORT:-16686}`<br/>`4317` (gRPC), `4318` (HTTP) | `http://localhost:16686` | [07-jaeger.md](07-jaeger.md) |
| 9 | `prometheus` | `ecommerce-prometheus` | Prometheus v2.51.2 thu thập và lưu trữ chuỗi thời gian metrics. | `${PROMETHEUS_PORT:-9090}` | `http://localhost:9090` | [08-prometheus.md](08-prometheus.md) |
| 10 | `alertmanager` | `ecommerce-alertmanager` | Alertmanager v0.27.0 phân loại và điều phối cảnh báo từ Prometheus. | `${ALERTMANAGER_PORT:-9093}` | `http://localhost:9093` | [09-alertmanager.md](09-alertmanager.md) |
| 11 | `grafana` | `ecommerce-grafana` | Grafana 10.4.2 bảng điều khiển trực quan hóa hệ thống tổng thể. | `${GRAFANA_PORT:-3002}` | `http://localhost:3002` | [10-grafana.md](10-grafana.md) |

### Ghi chú cấu hình biến môi trường:
- File mẫu cấu hình biến môi trường: `docker-compose/.env.example`.
- Cú pháp `${VAR:-default}` trong `docker-compose.yml` sẽ lấy giá trị từ `.env` nếu có, ngược lại lấy fallback sau dấu `:-`.
- RabbitMQ mặc định dùng tài khoản `${RABBITMQ_USER:-guest}` và mật khẩu `${RABBITMQ_PASSWORD:-guest}`.
- Grafana mặc định dùng `${GRAFANA_ADMIN_USER:-admin}` và `${GRAFANA_ADMIN_PASSWORD:-admin}`.

---

## 5. Các Lệnh Docker Compose Thường Dùng

Tất cả các lệnh dưới đây phải chạy từ thư mục `docker-compose`:

```bash
cd docker-compose
```

### Khởi động chế độ Hybrid (PostgreSQL + Redis + RabbitMQ):
```bash
docker compose up -d
```

### Khởi động toàn bộ stack 11 dịch vụ (Full Docker Mode):
```bash
docker compose --profile full-docker up -d
```

### Build lại images và khởi động:
```bash
docker compose --profile full-docker up -d --build
```

### Xem trạng thái container:
```bash
docker compose ps
```

### Xem log theo thời gian thực:
```bash
# Xem toàn bộ
docker compose logs -f

# Xem một service cụ thể
docker compose logs -f backend
docker compose logs -f rabbitmq
```

### Dừng toàn bộ stack:
```bash
# Dừng container nhưng giữ nguyên dữ liệu volumes
docker compose down

# Dừng và XÓA TOÀN BỘ volumes dữ liệu (Lưu ý: Mất dữ liệu DB, Redis, RabbitMQ, ES)
docker compose down -v
```

> **Cảnh báo về `docker compose down -v`:** Lệnh này sẽ xóa các named volumes: `postgres_data`, `redis_data`, `rabbitmq_data`, `elasticsearch_data`, `prometheus_data`, `grafana_data`. Chỉ dùng khi muốn đặt lại môi trường phát triển về trạng thái trắng ban đầu.

---

## 6. Checklist Kiểm Tra Sức Khỏe Dịch Vụ Sau Khi Chạy

Chạy lệnh kiểm tra từ thư mục `docker-compose`:

- [ ] **`postgres` healthy:**
  ```bash
  docker compose ps postgres
  ```
  Trạng thái: `healthy`. Port: `localhost:5432`.
- [ ] **`redis` healthy:**
  ```bash
  docker compose ps redis
  ```
  Trạng thái: `healthy`. Port: `localhost:6379`.
- [ ] **`rabbitmq` healthy:**
  ```bash
  docker compose ps rabbitmq
  ```
  Trạng thái: `healthy`. Broker port: `5672`, Management UI: `http://localhost:15672` (User/Pass: `guest`/`guest`).
- [ ] **`elasticsearch` healthy (khi chạy Full Docker):**
  ```bash
  docker compose ps elasticsearch
  ```
  Trạng thái: `healthy`. URL: `http://localhost:9200`.
- [ ] **`backend` healthy:**
  ```bash
  docker compose ps backend
  ```
  Trạng thái: `healthy` (kiểm tra qua `http://localhost:5000/api/health`).
- [ ] **`frontend-client` truy cập được:**
  Truy cập `http://localhost:3000`.
- [ ] **`frontend-dashboard` truy cập được:**
  Truy cập `http://localhost:3001`.
- [ ] **`jaeger` truy cập được:**
  Truy cập UI tại `http://localhost:16686`. Expose OTLP port `4317` & `4318`.
- [ ] **`prometheus` truy cập được:**
  Truy cập `http://localhost:9090`.
- [ ] **`alertmanager` truy cập được:**
  Truy cập `http://localhost:9093`.
- [ ] **`grafana` truy cập được:**
  Truy cập `http://localhost:3002` (User: `admin`, Pass: `admin`).
