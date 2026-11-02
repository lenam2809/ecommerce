Cập nhật lần cuối: 02/11/2026 — đối chiếu commit 3837493

# Service postgres

Quy ước lệnh: mọi lệnh `docker compose ...` trong tài liệu này phải chạy từ thư mục `docker-compose`. Nếu đang ở root repository, chạy:

```bash
cd docker-compose
```

## 1. Vai trò

`postgres` là service PostgreSQL database của hệ thống e-commerce khi chạy bằng Docker Compose. Service này lưu dữ liệu nghiệp vụ chính như người dùng, sản phẩm, đơn hàng, giỏ hàng, cấu hình hệ thống và các dữ liệu quan hệ khác mà backend cần đọc/ghi.

Trong `docker-compose.yml`, `backend` được cấu hình kết nối đến database này qua host nội bộ `postgres` và chờ `postgres` đạt trạng thái `healthy` trước khi khởi động.

## 2. Cấu hình trong docker-compose.yml

Cấu hình service `postgres` trong `docker-compose/docker-compose.yml`:

- `image`: `postgres:15-alpine`

  Sử dụng image PostgreSQL phiên bản 15 trên nền Alpine.

- `container_name`: `ecommerce-postgres`

  Tên container cố định khi Docker Compose tạo container cho service này.

- `restart policy`: `unless-stopped`

  Container sẽ tự khởi động lại khi bị dừng do lỗi hoặc khi Docker daemon khởi động lại, trừ khi developer chủ động dừng container.

- `environment`:

  ```yaml
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-yourpassword}
  POSTGRES_DB: ${POSTGRES_DB:-ecommerce_db}
  ```

  Các biến này được dùng khi PostgreSQL khởi tạo database lần đầu trên volume rỗng.

- `ports`:

  ```yaml
  - "${POSTGRES_PORT:-5432}:5432"
  ```

  Port host mặc định là `5432`, map vào port `5432` trong container. Nếu đặt `POSTGRES_PORT` trong `.env`, port host sẽ đổi theo giá trị đó.

- `volumes`:

  ```yaml
  - postgres_data:/var/lib/postgresql/data
  ```

  Dữ liệu PostgreSQL được lưu trong named volume `postgres_data`.

- `networks`:

  ```yaml
  - ecommerce-network
  ```

  Service nằm trong network nội bộ `ecommerce-network`, cho phép các service khác trong cùng Compose gọi đến bằng tên service `postgres`.

- `healthcheck`:

  ```yaml
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
  ```

  Docker kiểm tra PostgreSQL bằng lệnh `pg_isready -U postgres` mỗi 10 giây. Mỗi lần kiểm tra có timeout 5 giây và thử tối đa 5 lần trước khi đánh dấu container là không healthy.

  Lưu ý: healthcheck hiện hard-code user `postgres`. Nếu đổi `POSTGRES_USER` sang giá trị khác, cần kiểm tra thêm và có thể cần cập nhật healthcheck cho khớp.

## 3. Biến môi trường quan trọng

| Biến | Giá trị mặc định | Ý nghĩa | Có nên đổi khi deploy thật không |
|---|---|---|---|
| `POSTGRES_USER` | `postgres` | User PostgreSQL được tạo khi database khởi tạo lần đầu. | Nên đổi sang user riêng cho ứng dụng nếu deploy thật. Nếu đổi, cần đồng bộ connection string của backend và kiểm tra lại healthcheck. |
| `POSTGRES_PASSWORD` | `yourpassword` | Mật khẩu của user PostgreSQL khi database khởi tạo lần đầu. | Bắt buộc nên đổi. Không dùng mật khẩu mặc định khi deploy thật. |
| `POSTGRES_DB` | `ecommerce_db` | Tên database mặc định được tạo khi khởi tạo PostgreSQL lần đầu. | Có thể giữ hoặc đổi theo môi trường deploy, nhưng nếu đổi phải đồng bộ connection string của backend. |
| `POSTGRES_PORT` | `5432` | Port trên máy host được map vào port `5432` trong container. | Có thể đổi nếu port `5432` trên host bị chiếm hoặc muốn hạn chế expose port mặc định. |

## 4. Cách khởi động riêng Postgres

Chạy từ thư mục gốc dự án:

```bash
cd docker-compose
docker compose up -d postgres
```

Lệnh này chỉ khởi động service `postgres` và các thành phần Docker cần thiết cho service đó, như network và volume.

## 5. Cách kiểm tra Postgres đang chạy

Chạy từ thư mục `docker-compose`:

```bash
docker compose ps postgres
docker compose logs -f postgres
```

Nếu healthcheck hoạt động bình thường, `docker compose ps postgres` sẽ hiển thị container `ecommerce-postgres` ở trạng thái `healthy`.

Trạng thái `healthy` nghĩa là lệnh healthcheck trong Compose:

```bash
pg_isready -U postgres
```

đã trả về thành công trong container. Khi đó PostgreSQL đã sẵn sàng nhận kết nối ở mức cơ bản. Trạng thái này không đảm bảo migration của backend đã chạy xong; phần đó cần kiểm tra thêm ở log hoặc cơ chế migration của backend.

## 6. Cách kết nối vào Postgres trong container

Chạy từ thư mục `docker-compose`:

```bash
docker compose exec postgres psql -U postgres -d ecommerce_db
```

Lệnh trên dùng giá trị mặc định trong Compose:

- user: `postgres`
- database: `ecommerce_db`

Nếu đã đổi `POSTGRES_USER` hoặc `POSTGRES_DB` qua `.env`, cần đổi command tương ứng:

```bash
docker compose exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
```

Nếu PostgreSQL yêu cầu mật khẩu khi kết nối từ bên ngoài container, dùng giá trị của `POSTGRES_PASSWORD` đã cấu hình trong `.env` hoặc giá trị mặc định `yourpassword` nếu chưa override.

## 7. Cách backend kết nối đến Postgres

Khi `backend` chạy trong container, không nên dùng `localhost` để kết nối đến PostgreSQL. Trong container của backend, `localhost` là chính container backend, không phải container PostgreSQL.

Backend cần dùng host nội bộ là tên service trong Docker Compose:

```text
postgres
```

Trong `docker-compose.yml`, backend đang có connection string mặc định:

```text
Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;
```

Cấu hình này nằm trong biến môi trường của service `backend`:

```yaml
ConnectionStrings__DefaultConnection=${DB_CONNECTION_STRING:-Host=postgres;Database=ecommerce_db;Username=postgres;Password=yourpassword;}
```

Nếu đặt `DB_CONNECTION_STRING` trong `.env`, cần đảm bảo connection string vẫn dùng host `postgres` khi backend chạy trong Docker Compose.

## 8. Dữ liệu được lưu ở đâu

Dữ liệu database của service `postgres` được lưu trong named volume:

```text
postgres_data
```

Volume này được mount vào thư mục dữ liệu của PostgreSQL trong container:

```text
/var/lib/postgresql/data
```

Nhờ volume này, dữ liệu vẫn còn sau khi container bị xóa bằng:

```bash
docker compose down
```

Cảnh báo: lệnh dưới đây có thể xóa volume và làm mất dữ liệu PostgreSQL local:

```bash
docker compose down -v
```

Chỉ dùng `docker compose down -v` khi muốn reset dữ liệu local hoặc chắc chắn không cần giữ database hiện tại.

## 9. Lỗi thường gặp

### 9.1. Port 5432 bị chiếm

- Dấu hiệu: `docker compose up -d postgres` thất bại, log hoặc output báo không bind được port `5432`, ví dụ port is already allocated.
- Nguyên nhân: Máy host đã có PostgreSQL local hoặc container khác đang dùng port `5432`.
- Cách xử lý: Đổi `POSTGRES_PORT` trong `.env`, ví dụ dùng `5433`, rồi chạy lại:

  ```bash
  docker compose up -d postgres
  ```

  Khi kết nối từ máy host, dùng port mới. Khi backend chạy trong Compose, vẫn dùng host nội bộ `postgres` và port container `5432`.

### 9.2. Sai `POSTGRES_PASSWORD`

- Dấu hiệu: Kết nối database báo lỗi xác thực, ví dụ password authentication failed.
- Nguyên nhân: Mật khẩu trong connection string của backend hoặc công cụ kết nối không khớp với mật khẩu đã dùng lúc volume `postgres_data` được khởi tạo.
- Cách xử lý: Kiểm tra `POSTGRES_PASSWORD` và `DB_CONNECTION_STRING` trong `.env`. Nếu volume đã được tạo bằng mật khẩu cũ, đổi biến môi trường không tự đổi mật khẩu trong database hiện có. Cần đăng nhập database để đổi password hoặc reset volume nếu chấp nhận mất dữ liệu local.

### 9.3. Backend không kết nối được database

- Dấu hiệu: Log backend báo lỗi kết nối database, connection refused, could not translate host name, timeout hoặc authentication failed.
- Nguyên nhân: Backend dùng sai host, sai database, sai user/password, hoặc `postgres` chưa healthy. Khi backend chạy trong container, dùng `localhost` là sai.
- Cách xử lý: Kiểm tra connection string của backend. Khi chạy trong Docker Compose, host phải là:

  ```text
  postgres
  ```

  Sau đó kiểm tra trạng thái database:

  ```bash
  docker compose ps postgres
  docker compose logs -f postgres
  ```

### 9.4. Volume cũ giữ password hoặc database cũ

- Dấu hiệu: Đã đổi `POSTGRES_USER`, `POSTGRES_PASSWORD` hoặc `POSTGRES_DB` trong `.env` nhưng PostgreSQL vẫn hoạt động theo thông tin cũ, hoặc database mới không được tạo.
- Nguyên nhân: Image PostgreSQL chỉ dùng các biến `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` khi thư mục dữ liệu ban đầu còn rỗng. Volume `postgres_data` cũ đã có dữ liệu nên quá trình init không chạy lại.
- Cách xử lý: Nếu cần giữ dữ liệu, đăng nhập vào PostgreSQL và thay đổi user/password/database bằng SQL phù hợp. Nếu chỉ là môi trường local và chấp nhận mất dữ liệu, reset bằng:

  ```bash
  docker compose down -v
  docker compose up -d postgres
  ```

  Cần nhớ `docker compose down -v` có thể xóa dữ liệu trong `postgres_data`.

### 9.5. Container chưa `healthy`

- Dấu hiệu: `docker compose ps postgres` không hiển thị `healthy`, backend không khởi động hoặc đang chờ dependency.
- Nguyên nhân: PostgreSQL chưa sẵn sàng, cấu hình user trong healthcheck không khớp, dữ liệu volume có vấn đề, hoặc container đang restart.
- Cách xử lý: Xem log:

  ```bash
  docker compose logs -f postgres
  ```

  Kiểm tra healthcheck hiện tại đang dùng `pg_isready -U postgres`. Nếu đã đổi `POSTGRES_USER`, cần kiểm tra thêm vì healthcheck có thể cần đổi theo user mới.

### 9.6. Migration chưa chạy hoặc schema chưa được tạo

- Dấu hiệu: PostgreSQL đã `healthy`, backend kết nối được, nhưng backend báo lỗi thiếu bảng, thiếu relation hoặc dữ liệu seed chưa có.
- Nguyên nhân: Migration/schema của backend chưa chạy, chạy lỗi, hoặc logic tự động migrate không được kích hoạt. Compose chỉ khai báo PostgreSQL; việc chạy migration thuộc về backend và cần kiểm tra thêm trong code/log backend.
- Cách xử lý: Xem log backend để xác định migration có chạy hay không:

  ```bash
  docker compose logs -f backend
  ```

  Nếu dự án yêu cầu chạy migration thủ công, thực hiện theo tài liệu backend tương ứng. Nếu chưa chắc cơ chế migration hiện tại, cần kiểm tra thêm trong code backend.
