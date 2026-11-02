Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service rabbitmq

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`rabbitmq` là service Message Broker (hàng đợi thông điệp) của hệ thống e-commerce khi chạy bằng Docker Compose.

Trong hệ thống ShopViet, RabbitMQ đóng vai trò:
- Hạ tầng Message Broker định hướng sự kiện (Event-Driven Architecture) cho việc phân phối tác vụ bất đồng bộ.
- Xử lý hàng đợi gửi email thông báo, đồng bộ dữ liệu tìm kiếm Elasticsearch nền.
- Cung cấp giao diện quản trị Web Management UI trực quan để giám sát số lượng queues, exchanges, connections, và thông lượng message rate.
- Thuộc nhóm **dịch vụ hạ tầng cốt lõi (Core Infrastructure)** trong chế độ chạy Hybrid (`docker compose up -d`), khởi động cùng với PostgreSQL và Redis mà không cần cờ `--profile full-docker`.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `rabbitmq` trong `docker-compose/docker-compose.yml`:

- `image`: `rabbitmq:3.13-management-alpine`

  Sử dụng image RabbitMQ phiên bản 3.13 tích hợp sẵn plugin Management Web UI trên nền Alpine Linux gọn nhẹ và an toàn.

- `container_name`: `ecommerce-rabbitmq`

  Tên container cố định khi Docker Compose tạo container cho service này.

- `restart policy`: `unless-stopped`

  Container sẽ tự khởi động lại khi gặp sự cố hoặc khi Docker daemon khởi động lại.

- `environment`:

  ```yaml
  RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
  RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD:-guest}
  RABBITMQ_DEFAULT_VHOST: ${RABBITMQ_VHOST:-/}
  ```

  Tài khoản và vhost mặc định dùng khi RabbitMQ khởi tạo broker lần đầu trên volume rỗng.

- `ports`:

  ```yaml
  - "${RABBITMQ_PORT:-5672}:5672"
  - "${RABBITMQ_MANAGEMENT_PORT:-15672}:15672"
  ```

  - Port `5672` (hoặc biến `RABBITMQ_PORT` trong `.env`): Cổng giao thức AMQP 0-9-1 dành cho backend và worker kết nối gửi/nhận message.
  - Port `15672` (hoặc biến `RABBITMQ_MANAGEMENT_PORT` trong `.env`): Cổng HTTP phục vụ giao diện Web Management UI.

- `volumes`:

  ```yaml
  - rabbitmq_data:/var/lib/rabbitmq
  ```

  Named volume `rabbitmq_data` lưu trữ trạng thái của broker, định nghĩa exchange/queue bền vững (durable) và tin nhắn chưa tiêu thụ.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

- `healthcheck`:

  ```yaml
  test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 15s
  ```

  Kiểm tra sức khỏe container bằng công cụ `rabbitmq-diagnostics ping`.

## 3. Truy cập Giao diện Quản trị (Web Management UI)

Sau khi khởi chạy service, developer có thể truy cập Web UI:

- **URL:** [http://localhost:15672](http://localhost:15672)
- **Tài khoản mặc định:** `guest`
- **Mật khẩu mặc định:** `guest`
- **Virtual Host mặc định:** `/`

Tại giao diện này, bạn có thể:
- Xem tổng quan thông lượng (Message rates: publish, deliver, acknowledge).
- Quản lý danh sách Queues, Exchanges, Bindings.
- Kiểm tra danh sách Connections từ backend.
- Tạo mới user và phân quyền permissions nếu cần.

## 4. Các Lệnh Thao Tác Thường Dùng

Khởi động riêng service `rabbitmq`:

```bash
docker compose up -d rabbitmq
```

Xem log thời gian thực:

```bash
docker compose logs -f rabbitmq
```

Kiểm tra trạng thái container:

```bash
docker compose ps rabbitmq
```

Kiểm tra trạng thái cluster & node:

```bash
docker compose exec rabbitmq rabbitmq-diagnostics status
```

Liệt kê danh sách queues đang hoạt động:

```bash
docker compose exec rabbitmq rabbitmqctl list_queues
```

Khởi động lại service:

```bash
docker compose restart rabbitmq
```

## 5. Xử Lý Sự Cố Thường Gặp (Troubleshooting)

1. **Không đăng nhập được vào Web Management UI bằng tài khoản `guest`:**
   - Mặc định RabbitMQ chỉ cho phép tài khoản `guest`/`guest` đăng nhập từ `localhost`. Khi truy cập qua Docker port mapping trên máy host (`localhost:15672`), đăng nhập được hỗ trợ bình thường.
   - Nếu đổi tài khoản trong `.env` sau khi volume `rabbitmq_data` đã khởi tạo, RabbitMQ sẽ không tự đổi mật khẩu cũ. Bạn cần dùng lệnh sau để cập nhật mật khẩu:
     ```bash
     docker compose exec rabbitmq rabbitmqctl change_password guest your_new_password
     ```
2. **Container thoát hoặc báo lỗi port xung đột (EADDRINUSE):**
   - Kiểm tra xem máy host có đang chạy dịch vụ RabbitMQ local hay không:
     ```powershell
     Get-NetTCPConnection -LocalPort 5672,15672 -ErrorAction SilentlyContinue
     ```
   - Nếu bị trùng, hãy đổi `RABBITMQ_PORT=5673` hoặc `RABBITMQ_MANAGEMENT_PORT=15673` trong file `.env`.
