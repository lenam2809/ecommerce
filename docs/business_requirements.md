# Tài liệu Yêu cầu Nghiệp vụ (Business Requirements)

## 1. Tổng quan dự án
Hệ thống Thương mại điện tử (E-commerce) bao gồm:
- **Client (Frontend)**: Ứng dụng Next.js phục vụ người dùng cuối (Storefront).
- **Backend API**: Hệ thống .NET 8 xây dựng theo kiến trúc Clean Architecture/DDD.

## 2. Phạm vi nghiệp vụ

### Các Module chính
1.  **Authentication (Xác thực)**: Đăng ký, Đăng nhập, Quản lý Token (Cookie + LocalStorage).
2.  **Catalog (Danh mục sản phẩm)**: Duyệt, Tìm kiếm, Lọc sản phẩm.
3.  **Shopping Cart (Giỏ hàng)**: Thêm/Sửa/Xóa sản phẩm, Mã giảm giá.
4.  **Checkout (Thanh toán)**: Quy trình đặt hàng, Chọn địa chỉ, Phương thức thanh toán.
5.  **Order Management (Quản lý đơn hàng)**: Theo dõi trạng thái, Lịch sử mua hàng.
6.  **User Profile (Hồ sơ người dùng)**: Quản lý thông tin cá nhân, Sổ địa chỉ.

### Tác nhân (Actors)
-   **Guest (Khách vãng lai)**: Xem sản phẩm, Đăng ký/Đăng nhập.
-   **Authenticated User (Thành viên)**: Mua hàng, Quản lý đơn hàng, Quản lý hồ sơ.
-   **Admin (Quản trị viên)**: (Out of scope cho repo client hiện tại) Quản lý hệ thống.

## 3. Quy trình nghiệp vụ chính

### Quy trình Đặt hàng (Checkout Process)
1.  Người dùng thêm sản phẩm vào giỏ.
2.  Tiến hành thanh toán (yêu cầu đăng nhập).
3.  Nhập/Chọn địa chỉ giao hàng.
4.  Hệ thống tính phí vận chuyển tự động.
5.  Chọn phương thức thanh toán (COD, Chuyển khoản, v.v.).
6.  Xác nhận đặt hàng -> Tạo đơn hàng (Pending).

### Quy trình Xử lý Đơn hàng (Order Lifecycle)
Các trạng thái đơn hàng:
1.  **Pending (0)**: Đơn hàng mới tạo.
2.  **Processing (1)**: Đang xử lý.
3.  **Shipped (2)**: Đã giao cho đơn vị vận chuyển.
4.  **Delivered (3)**: Giao hàng thành công.
5.  **Cancelled (4)**: Đã hủy.
6.  **Returned (5)**: Trả hàng.

## 4. Quy tắc nghiệp vụ (Business Rules)

### Vận chuyển (Shipping)
-   **Miễn phí vận chuyển**: Cho đơn hàng có giá trị > 500,000 VND.
-   **Phí cố định**: 30,000 VND cho đơn hàng <= 500,000 VND.

### Đơn hàng (Orders)
-   Thông tin bắt buộc: Tên, Số điện thoại, Email, Địa chỉ chi tiết.
-   Phương thức thanh toán mặc định: COD (Thanh toán khi nhận hàng).

## 5. Kiến trúc & Kỹ thuật

### Frontend (Next.js)
-   **Framework**: Next.js (App Router).
-   **State Management**: React Context / Hooks (`useCart`, `useAuth`).
-   **Styling**: Tailwind CSS.

### Backend (.NET 8)
-   **Architecture**: Clean Architecture (Domain, Application, Infrastructure, WebAPI).
-   **Pattern**: CQRS với MediatR.
-   **Data Access**: Entity Framework Core.
-   **Events**: Domain Events cho các nghiệp vụ quan trọng (Order Created, etc.).

## 6. Lộ trình cải tiến (Roadmap)
-   **Backend**: Tối ưu hóa Module Cart & Orders (DDD Rich Domain Model), tách logic thông báo (Notification).
-   **Frontend**: Cải thiện UX Checkout, tích hợp cổng thanh toán thực tế (Payment Gateway).
