Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service alertmanager

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`alertmanager` là service nhận và xử lý alert do Prometheus gửi sang.

Alertmanager dùng để:

- Nhận alert từ Prometheus khi alert rule thỏa điều kiện.
- Gom nhóm alert theo cấu hình `group_by` để tránh gửi quá nhiều cảnh báo rời rạc.
- Định tuyến cảnh báo đến receiver phù hợp.
- Gửi cảnh báo qua các kênh được cấu hình nếu có, ví dụ Slack, email hoặc Telegram.

Trong cấu hình hiện tại, Alertmanager đã khai báo receiver và các kênh gửi cảnh báo, nhưng các giá trị đang là placeholder. Vì vậy cấu hình này dùng được để kiểm tra cấu trúc Alertmanager, nhưng chưa thể xem là cấu hình gửi cảnh báo thật cho môi trường deploy.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `alertmanager` trong `docker-compose/docker-compose.yml`:

- `image`: `prom/alertmanager:v0.27.0`

  Sử dụng Alertmanager phiên bản `v0.27.0`.

- `container_name`: `ecommerce-alertmanager`

  Tên container cố định khi Docker Compose tạo container Alertmanager.

- `restart policy`: `unless-stopped`

  Container tự restart khi lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `command`:

  ```yaml
  - "--config.file=/etc/alertmanager/alertmanager.yml"
  ```

  Alertmanager đọc file cấu hình tại `/etc/alertmanager/alertmanager.yml`.

- `ports`:

  ```yaml
  - "${ALERTMANAGER_PORT:-9093}:9093"
  ```

  Port host mặc định là `9093`, map vào port `9093` trong container.

- `volumes`:

  ```yaml
  - ./observability/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
  ```

  File `docker-compose/observability/alertmanager/alertmanager.yml` được mount read-only vào container.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Alertmanager nằm trong network nội bộ `ecommerce-network`, để Prometheus có thể gửi alert đến hostname `alertmanager`.

Compose hiện không khai báo `depends_on` hoặc `healthcheck` cho service `alertmanager`.

## 3. File cấu hình Alertmanager

File được mount:

```text
docker-compose/observability/alertmanager/alertmanager.yml
```

Nội dung hiện tại:

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: "smtp.example.com:587"
  smtp_from: "alerts@example.com"
  smtp_auth_username: "alerts@example.com"
  smtp_auth_password: "replace-me"

route:
  receiver: ops-all
  group_by:
    - alertname
    - service
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h

receivers:
  - name: ops-all
    slack_configs:
      - api_url: "https://hooks.slack.com/services/replace/me"
        send_resolved: true
        title: "{{ .CommonLabels.alertname }} [{{ .CommonLabels.severity }}]"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"
    email_configs:
      - to: "ops@example.com"
        send_resolved: true
    telegram_configs:
      - bot_token: "000000000:replace-me"
        chat_id: 0
        send_resolved: true
        message: "{{ .CommonLabels.alertname }}: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}"
```

Tóm tắt cấu hình:

| Thành phần | Giá trị hiện tại | Ý nghĩa |
|---|---|---|
| `resolve_timeout` | `5m` | Thời gian Alertmanager chờ trước khi xem alert đã resolved nếu không còn được Prometheus gửi tiếp. |
| `route.receiver` | `ops-all` | Tất cả alert mặc định được gửi đến receiver `ops-all`. |
| `group_by` | `alertname`, `service` | Alert được gom nhóm theo tên alert và service. |
| `group_wait` | `30s` | Chờ 30 giây trước khi gửi nhóm alert đầu tiên, để gom thêm alert cùng nhóm nếu có. |
| `group_interval` | `5m` | Khoảng thời gian tối thiểu giữa các lần gửi cập nhật cho cùng một nhóm alert. |
| `repeat_interval` | `1h` | Nếu alert vẫn còn firing, gửi lại cảnh báo sau mỗi 1 giờ. |
| Receiver | `ops-all` | Receiver duy nhất trong file hiện tại. |

Kênh gửi cảnh báo đang được khai báo:

- Slack qua `slack_configs`.
- Email qua `email_configs`.
- Telegram qua `telegram_configs`.

Tuy nhiên các giá trị sau đang là placeholder:

- `smtp_smarthost: "smtp.example.com:587"`
- `smtp_from: "alerts@example.com"`
- `smtp_auth_username: "alerts@example.com"`
- `smtp_auth_password: "replace-me"`
- Slack webhook `https://hooks.slack.com/services/replace/me`
- Email nhận `ops@example.com`
- Telegram bot token `000000000:replace-me`
- Telegram `chat_id: 0`

Vì vậy cấu hình hiện tại chưa phải cấu hình gửi cảnh báo thật. Nếu muốn gửi cảnh báo ra Slack/email/Telegram, cần thay các placeholder bằng thông tin thật và kiểm tra bảo mật secret trước khi commit.

## 4. Cách khởi động Alertmanager

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d alertmanager
```

Lệnh này khởi động riêng service `alertmanager` cùng network cần thiết.

## 5. Cách xem log

Chạy từ thư mục `docker-compose`:

```bash
docker compose logs -f alertmanager
```

Log Alertmanager là nơi cần xem đầu tiên khi container không start, parse config lỗi, receiver thiếu hoặc webhook/email/Telegram gửi lỗi.

## 6. Cách truy cập UI

Theo Compose:

```yaml
ports:
  - "${ALERTMANAGER_PORT:-9093}:9093"
```

Nếu không override `ALERTMANAGER_PORT`, truy cập UI tại:

```text
http://localhost:9093
```

Nếu đã đặt `ALERTMANAGER_PORT` trong `.env`, dùng port đó:

```text
http://localhost:<ALERTMANAGER_PORT>
```

## 7. Quan hệ với Prometheus

Prometheus gửi alert sang Alertmanager theo file:

```text
docker-compose/observability/prometheus/prometheus.yml
```

Cấu hình Prometheus hiện tại:

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

Điểm cần chú ý:

- `alertmanager` là hostname nội bộ trong network `ecommerce-network`.
- `9093` là port container của Alertmanager.
- Nếu chỉ đổi `ALERTMANAGER_PORT` để truy cập UI từ host, Prometheus vẫn nên dùng `alertmanager:9093` trong Docker network.
- Prometheus service có `depends_on: - alertmanager`, nên Compose start Alertmanager trước Prometheus. Nhưng `depends_on` không xác nhận Alertmanager đã parse config thành công hoặc đã sẵn sàng nhận alert.

## 8. Lỗi thường gặp

### 8.1. Alertmanager không start do lỗi YAML

- Dấu hiệu: Container `ecommerce-alertmanager` thoát, restart liên tục hoặc `docker compose ps alertmanager` không ở trạng thái running.
- Nguyên nhân: File `docker-compose/observability/alertmanager/alertmanager.yml` sai YAML, sai indentation, thiếu dấu `:` hoặc cấu trúc không hợp lệ.
- Cách xử lý: Xem log trực tiếp:

  ```bash
  docker compose logs -f alertmanager
  ```

  Kiểm tra file:

  ```text
  docker-compose/observability/alertmanager/alertmanager.yml
  ```

  Sau khi sửa, restart:

  ```bash
  docker compose restart alertmanager
  ```

### 8.2. Thiếu receiver hoặc route trỏ sai receiver

- Dấu hiệu: Log báo receiver không tồn tại, route không hợp lệ hoặc Alertmanager không load được config.
- Nguyên nhân: `route.receiver` phải trỏ đến một receiver có trong danh sách `receivers`. File hiện tại dùng:

  ```yaml
  route:
    receiver: ops-all

  receivers:
    - name: ops-all
  ```

  Nếu đổi tên receiver nhưng không đổi đồng bộ, config sẽ lỗi.

- Cách xử lý: Đảm bảo `route.receiver` và `receivers[].name` khớp nhau. Sau đó restart:

  ```bash
  docker compose restart alertmanager
  docker compose logs -f alertmanager
  ```

### 8.3. Prometheus không gửi alert sang Alertmanager

- Dấu hiệu: Alert rule firing trong Prometheus nhưng Alertmanager UI không thấy alert.
- Nguyên nhân: Prometheus không kết nối được `alertmanager:9093`, Alertmanager chưa chạy, hoặc file `prometheus.yml` không có cấu hình alertmanager đúng.
- Cách xử lý: Kiểm tra cả hai service:

  ```bash
  docker compose ps prometheus alertmanager
  docker compose logs -f prometheus
  docker compose logs -f alertmanager
  ```

  Kiểm tra `docker-compose/observability/prometheus/prometheus.yml` có target:

  ```yaml
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
  ```

### 8.4. Port 9093 bị chiếm

- Dấu hiệu: `docker compose up -d alertmanager` thất bại, output báo không bind được port `9093` hoặc port is already allocated.
- Nguyên nhân: Máy host đã có Alertmanager khác hoặc service khác đang dùng port `9093`.
- Cách xử lý: Đổi port host bằng `ALERTMANAGER_PORT` trong `.env`, ví dụ:

  ```env
  ALERTMANAGER_PORT=9094
  ```

  Sau đó chạy lại:

  ```bash
  docker compose up -d alertmanager
  docker compose ps alertmanager
  ```

  Truy cập UI bằng:

  ```text
  http://localhost:9094
  ```

  Không đổi target trong Prometheus nếu Prometheus vẫn chạy trong cùng Docker network; Prometheus vẫn gửi đến `alertmanager:9093`.

### 8.5. Alert không xuất hiện trên UI

- Dấu hiệu: Alertmanager UI mở được nhưng không thấy alert nào.
- Nguyên nhân: Prometheus chưa có alert firing, Prometheus không gửi được alert sang Alertmanager, hoặc alert đã resolved. Alertmanager không tự tạo alert; nó chỉ nhận alert từ Prometheus.
- Cách xử lý: Kiểm tra Prometheus trước:

  ```text
  http://localhost:9090
  ```

  Vào phần alert trong Prometheus để xem có alert firing hay không. Sau đó kiểm tra log:

  ```bash
  docker compose logs -f prometheus
  docker compose logs -f alertmanager
  ```

  Nếu Prometheus chưa firing alert, cần kiểm tra rule trong `docker-compose/observability/prometheus/alerts.yml` và metrics backend.

### 8.6. Cấu hình webhook/email/Slack/Telegram chưa đúng

- Dấu hiệu: Alert xuất hiện trong Alertmanager UI nhưng không gửi ra Slack, email hoặc Telegram.
- Nguyên nhân: File hiện tại có cấu hình kênh gửi nhưng đang dùng placeholder:

  ```yaml
  api_url: "https://hooks.slack.com/services/replace/me"
  smtp_smarthost: "smtp.example.com:587"
  smtp_auth_password: "replace-me"
  bot_token: "000000000:replace-me"
  chat_id: 0
  ```

  Đây không phải thông tin gửi cảnh báo thật.

- Cách xử lý: Thay placeholder bằng cấu hình thật cho kênh muốn dùng. Với secret như Slack webhook, SMTP password, Telegram bot token, cần lưu ý không commit secret thật vào git. Sau khi sửa:

  ```bash
  docker compose restart alertmanager
  docker compose logs -f alertmanager
  ```

### 8.7. Log báo lỗi parse config

- Dấu hiệu: `docker compose logs -f alertmanager` có thông báo parse config, unmarshal error, unknown field hoặc lỗi template.
- Nguyên nhân: Cấu trúc `alertmanager.yml` không hợp lệ với `prom/alertmanager:v0.27.0`, field sai vị trí, sai kiểu dữ liệu hoặc template trong `title`, `text`, `message` sai cú pháp.
- Cách xử lý: Đọc chính xác dòng lỗi trong log, sửa file cấu hình rồi restart:

  ```bash
  docker compose restart alertmanager
  docker compose logs -f alertmanager
  ```

  Nếu vừa chỉnh template, kiểm tra kỹ các đoạn:

  ```yaml
  title: "{{ .CommonLabels.alertname }} [{{ .CommonLabels.severity }}]"
  text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"
  message: "{{ .CommonLabels.alertname }}: {{ range .Alerts }}{{ .Annotations.description }}{{ end }}"
  ```

### 8.8. Alertmanager chạy nhưng Prometheus báo lỗi kết nối

- Dấu hiệu: Alertmanager UI truy cập được từ `localhost`, nhưng Prometheus log báo không gửi được alert đến Alertmanager.
- Nguyên nhân: Prometheus gửi qua Docker network đến `alertmanager:9093`, không dùng port host. Nếu đổi tên service, đổi network hoặc sửa target trong `prometheus.yml` thành `localhost:9093`, Prometheus trong container sẽ không gửi đúng.
- Cách xử lý: Giữ target Prometheus theo Compose:

  ```text
  alertmanager:9093
  ```

  Kiểm tra hai service cùng network:

  ```bash
  docker compose ps prometheus alertmanager
  ```

  Sau khi sửa `prometheus.yml`, restart Prometheus:

  ```bash
  docker compose restart prometheus
  ```

### 8.9. Nhầm lẫn khi dùng `docker compose down -v`

- Dấu hiệu: Sau khi reset stack, dữ liệu database, cache, index search, metrics hoặc cấu hình Grafana local bị mất dù chỉ đang debug Alertmanager.
- Nguyên nhân: Service `alertmanager` không khai báo named volume riêng trong `docker-compose.yml`; file cấu hình `alertmanager.yml` là bind mount read-only từ source code. Tuy vậy, lệnh dưới đây chạy ở cấp toàn Docker Compose project và có thể xóa các named volume của service khác:

  ```bash
  docker compose down -v
  ```

  Các volume dữ liệu liên quan gồm `postgres_data`, `redis_data`, `elasticsearch_data`, `prometheus_data` và `grafana_data`.

- Cách xử lý: Nếu chỉ muốn restart Alertmanager sau khi sửa cấu hình, chạy từ thư mục `docker-compose`:

  ```bash
  cd docker-compose
  docker compose restart alertmanager
  docker compose logs -f alertmanager
  ```

  Chỉ dùng `docker compose down -v` khi muốn reset toàn bộ dữ liệu local của stack.
