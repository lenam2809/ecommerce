# Hướng Dẫn Chạy Dự Án Bằng Docker

Hệ thống Ecommerce được container hóa bao gồm 4 services chính:
- **Backend**: .NET 8.0 Web API
- **Frontend Client**: Next.js 15
- **Frontend Dashboard**: Next.js 15 (Admin)
- **Redis**: Caching service

> **Lưu ý**: Database **SQL Server** chạy local (không nằm trong Docker) để tận dụng database có sẵn và dễ dàng quản lý dữ liệu.

---

## 1. Yêu cầu hệ thống (Prerequisites)

1.  **Docker Desktop** đã được cài đặt và đang chạy.
2.  **SQL Server** (Local) đã được cài đặt.
3.  **Git** (để clone code).

---

## 2. Cấu hình SQL Server Local

Docker container cần kết nối với SQL Server trên máy host.

1.  Đảm bảo SQL Server đã bật **TCP/IP** và port **1433**.
2.  Đảm bảo SQL Server cho phép **SQL Server and Windows Authentication mode** (Mixed Mode).
3.  Cấu hình tài khoản (Mặc định trong `.env` đang dùng `sa`/`sa`):
    *   Bạn có thể dùng tài khoản `sa`.
    *   Hoặc tạo user riêng `ecommerce_user`:

```sql
CREATE LOGIN ecommerce_user WITH PASSWORD = 'Strong@Password123';
USE ecommerce_db;
CREATE USER ecommerce_user FOR LOGIN ecommerce_user;
ALTER ROLE db_owner ADD MEMBER ecommerce_user;
```

*(Nếu dùng user riêng, hãy cập nhật file `.env`)*

---

## 3. Cấu hình Environment

File cấu hình nằm tại: `docker-compose/.env`

Các biến quan trọng:
*   `DB_CONNECTION_STRING`: Chuỗi kết nối CS. Lưu ý `Server=host.docker.internal` để trỏ về máy host.
*   `JWT_SECRET_KEY`: Key bảo mật cho token.
*   `FILE_STORAGE_UPLOAD_FOLDER`: Thư mục lưu ảnh.

**Lưu ý về File Upload:**
Hệ thống đã được cấu hình để map thư mục ảnh từ code local vào container:
- Local: `apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads`
- Docker: `/app/wwwroot/uploads`
Điều này giúp bạn giữ lại được các file ảnh ngay cả khi xóa container.

---

## 4. Chạy dự án

Mở terminal tại thư mục `docker-compose`:

```bash
cd docker-compose
```

### Build và chạy tất cả services:

```bash
docker compose up -d --build
```

### Các lệnh thường dùng khác:

```bash
# Xem logs real-time
docker compose logs -f

# Xem trạng thái các containers
docker compose ps

# Restart services (ví dụ backend)
docker compose restart backend

# Dừng và xóa containers
docker compose down
```

---

## 5. Truy cập hệ thống

Sau khi khởi động thành công:

| Service | URL | Mô tả |
|---------|-----|-------|
| **Client Website** | http://localhost:3000 | Trang mua sắm cho khách hàng |
| **Admin Dashboard** | http://localhost:3001 | Trang quản trị |
| **Backend API** | http://localhost:5000 | API Server (Swagger có thể bị tắt ở mode Production) |

---

## 6. Troubleshooting (Sự cố thường gặp)

### Backend không kết nối được Database
*   **Lỗi**: `Login failed for user...` hoặc `A network-related or instance-specific error...`
*   **Khắc phục**:
    1. Kiểm tra username/password trong `.env`.
    2. Đảm bảo SQL Server đã bật TCP/IP (kiểm tra trong *Sql Server Configuration Manager*).
    3. Đảm bảo Firewall không chặn port 1433.

### Ảnh không hiển thị hoặc lỗi Upload
*   **Lỗi**: Ảnh sản phẩm bị vỡ(404).
*   **Khắc phục**:
    1. Kiểm tra thư mục `apps/backend/Ecommerce/Ecommerce.WebAPI/wwwroot/uploads` có tồn tại và có ảnh không.
    2. Nếu upload lỗi, kiểm tra permissions (trên Linux/Mac) hoặc restart backend.

### Frontend không gọi được API
*   **Lỗi**: `Network Error` hoặc `Connection Refused`.
*   **Khắc phục**:
    1. Kiểm tra backend có đang chạy không: `docker compose ps`
    2. Kiểm tra biến `NEXT_PUBLIC_API_URL` trong `.env` có đúng là `http://localhost:5000/api` không.
